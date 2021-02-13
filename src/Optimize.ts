/**
 * @since 0.0.1
 */
import { flow } from 'fp-ts/function'
import type { Reader } from 'fp-ts/Reader'

import type { Doc } from './Doc'
import * as D from './Doc'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * Represents optimization of a given document tree through fusion of redundant
 * document nodes.
 *
 * @category model
 * @since 0.0.1
 */
export type Optimize<A> = Reader<FusionDepth, D.Doc<A>>

/**
 * Represents an instruction that determines how deeply the document fusion optimizer
 * should traverse the document tree.
 *
 * @category model
 * @since 0.0.1
 */
export type FusionDepth = Shallow | Deep

/**
 * Instructs the document fusion optimizer to avoid diving deeply into nested
 * documents, fusing mostly concatenations of text nodes together.
 *
 * @category model
 * @since 0.0.1
 */
export type Shallow = 'Shallow'

/**
 * Instructs the document fusion optimizer to recurse into all leaves of the document
 * tree, including different layout alternatives and all location-sensitive values
 * (i.e. those created by `nesting`), which cannot be fused before, but only during,
 * the layout process. As a result, the performance cost of using deep document fusion
 * optimization is often hard to predict and depends on the interplay between page
 * layout and the document that is to be pretty printed.
 *
 * This value should only be utilized if profiling demonstrates that it is
 * **significantly** faster than using `Shallow`.
 *
 * @category model
 * @since 0.0.1
 */
export type Deep = 'Deep'

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 0.0.1
 */
export const Shallow: FusionDepth = 'Shallow'

/**
 * @category constructors
 * @since 0.0.1
 */
export const Deep: FusionDepth = 'Deep'

// -------------------------------------------------------------------------------------
// optimizer
// -------------------------------------------------------------------------------------

/**
 * The `optimizer` will combine text nodes so that they can be rendered more
 * efficiently. An optimized document is always laid out in an identical manner to its
 * un-optimized counterpart.
 *
 * When laying a `Doc` out to a `SimpleDocStream`, every component of the input
 * document is translated directly to the simpler output format. This sometimes
 * yields undesirable chunking when many pieces have been concatenated together.
 *
 * For example:
 *
 * ```ts
 * const foldDocs = M.fold(D.getMonoid<never>())
 * foldDocs([D.Char('a'), D.Char('b'), D.Char('c'), D.Char('d')])
 * // => abcd
 * ```
 *
 * results in a chain of four entries in the output `SimpleDocStream`, although
 * this is fully equivalent to the tightly packed
 *
 * ```typescript
 * D.Text('abcd')
 * // => abcd
 * ```
 *
 * which is only a single entry in the output `SimpleDocStream`, and can be processed
 * much more efficiently.
 *
 * It is therefore a good idea to run `fuse` on concatenations of lots of small
 * strings that are used many times.
 *
 *
 * @category optimizers
 * @since 0.0.1
 */
export const optimize = <A>(doc: Doc<A>): Optimize<A> => (depth) => {
  const go: (x: Doc<A>) => Doc<A> = D.fold<A, Doc<A>>({
    Fail: () => D.Fail,
    Empty: () => D.Empty,
    Char: (c) => D.Char(c),
    Text: (t) => D.Text(t),
    Line: () => D.Line,
    FlatAlt: (x, y) => D.FlatAlt(go(x), go(y)),
    Cat: (x, y) => {
      // Empty documents
      if (x._tag === 'Empty') return go(y)
      if (y._tag === 'Empty') return go(x)

      // String documents
      if (x._tag === 'Char' && y._tag === 'Char') return D.Text(x.char + y.char)
      if (x._tag === 'Text' && y._tag === 'Char') return D.Text(x.text + y.char)
      if (x._tag === 'Char' && y._tag === 'Text') return D.Text(x.char + y.text)
      if (x._tag === 'Text' && y._tag === 'Text') return D.Text(x.text + y.text)

      // Nested strings
      if (x._tag === 'Char' && y._tag === 'Cat' && y.x._tag === 'Char') {
        return go(D.Cat(go(D.Cat(x, y.x)), y.y))
      }
      if (x._tag === 'Text' && y._tag === 'Cat' && y.x._tag === 'Char') {
        return go(D.Cat(go(D.Cat(x, y.x)), y.y))
      }
      if (x._tag === 'Char' && y._tag === 'Cat' && y.x._tag === 'Text') {
        return go(D.Cat(go(D.Cat(x, y.x)), y.y))
      }
      if (x._tag === 'Text' && y._tag === 'Cat' && y.x._tag === 'Text') {
        return go(D.Cat(go(D.Cat(x, y.x)), y.y))
      }
      if (x._tag === 'Cat' && x.y._tag === 'Char') {
        return go(D.Cat(x.x, go(D.Cat(x.y, y))))
      }
      if (x._tag === 'Cat' && x.y._tag === 'Text') {
        return go(D.Cat(x.x, go(D.Cat(x.y, y))))
      }
      return D.Cat(go(x), go(y))
    },
    Nest: (i, x) => {
      if (x._tag === 'Empty') return x
      if (x._tag === 'Char') return x
      if (x._tag === 'Text') return x
      if (x._tag === 'Nest') return go(D.Nest(i + x.indent, x.doc))
      if (i === 0) return go(x)
      return D.Nest(i, go(x))
    },
    Union: (x, y) => D.Union(go(x), go(y)),
    Column: (f) => (depth === Shallow ? D.Column(f) : D.Column(flow(f, go))),
    WithPageWidth: (f) => (depth === Shallow ? D.WithPageWidth(f) : D.WithPageWidth(flow(f, go))),
    Nesting: (f) => (depth === Shallow ? D.Nesting(f) : D.Nesting(flow(f, go))),
    Annotated: (ann, x) => D.Annotated(ann, go(x))
  })
  return go(doc)
}
