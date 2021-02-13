/**
 * @since 0.0.1
 */
import { absurd, constFalse, constTrue, not, pipe } from 'fp-ts/function'
import type { Option } from 'fp-ts/Option'
import * as O from 'fp-ts/Option'
import type { Reader } from 'fp-ts/Reader'
import * as RA from 'fp-ts/ReadonlyArray'

import type { Doc } from './Doc'
import * as D from './Doc'
import type { PageWidth } from './PageWidth'
import * as PW from './PageWidth'
import type { SimpleDocStream } from './SimpleDocStream'
import * as SDS from './SimpleDocStream'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

export interface Layout<A> extends Reader<LayoutOptions, SimpleDocStream<A>> {}

/**
 * Represents the options that will influence the layout algorithms.
 *
 * @category model
 * @since 0.0.1
 */
export interface LayoutOptions {
  readonly pageWidth: PageWidth
}

/**
 * Represents a list of nesting level/document pairs that are yet to be laid out.
 *
 * @category model
 * @since 0.0.1
 */
export type LayoutPipeline<A> = Nil | Cons<A> | UndoAnn<A>

/**
 * @category model
 * @since 0.0.1
 */
export interface Nil {
  readonly _tag: 'Nil'
}

/**
 * @category model
 * @since 0.0.1
 */
export interface Cons<A> {
  readonly _tag: 'Cons'
  readonly indentation: number
  readonly document: Doc<A>
  readonly pipeline: LayoutPipeline<A>
}

/**
 * @category model
 * @since 0.0.1
 */
export interface UndoAnn<A> {
  readonly _tag: 'UndoAnn'
  readonly pipeline: LayoutPipeline<A>
}

/**
 * Decides whether a `SimpleDocStream` fits the given constraints, namely:
 * - original indentation of the current
 * - current column
 * - initial indentation of the alternative `SimpleDocStream` if it starts with
 * a line break (used by `layoutSmart`)
 * - width in which to fit the first line
 *
 * @category model
 * @since 0.0.1
 */
export type FittingPredicate<A> = (
  lineIndent: number,
  currentColumn: number,
  initialIndentY: Option<number>,
  stream: SimpleDocStream<A>
) => boolean

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 0.0.1
 */
export const Nil: LayoutPipeline<never> = {
  _tag: 'Nil'
}

/**
 * @category constructors
 * @since 0.0.1
 */
export const Cons = <A>(
  indentation: number,
  document: Doc<A>,
  pipeline: LayoutPipeline<A>
): LayoutPipeline<A> => ({
  _tag: 'Cons',
  indentation,
  document,
  pipeline
})

/**
 * @category constructors
 * @since 0.0.1
 */
export const UndoAnn = <A>(pipeline: LayoutPipeline<A>): LayoutPipeline<A> => ({
  _tag: 'UndoAnn',
  pipeline
})

/**
 * @category constructors
 * @since 0.0.1
 */
export const LayoutOptions = (pageWidth: PageWidth): LayoutOptions => ({
  pageWidth
})

/**
 * The default layout options, which are suitable when you want to obtain output
 * but do not care about the details.
 *
 * @category constructors
 * @since 0.0.1
 */
export const defaultLayoutOptions = LayoutOptions(PW.defaultPageWidth)

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * @category destructors
 * @since 0.0.1
 */
export const fold = <A, R>(patterns: {
  readonly Nil: () => R
  readonly Cons: (indentation: number, document: Doc<A>, pipeline: LayoutPipeline<A>) => R
  readonly UndoAnn: (pipeline: LayoutPipeline<A>) => R
}): ((pipeline: LayoutPipeline<A>) => R) => {
  const f = (x: LayoutPipeline<A>): R => {
    switch (x._tag) {
      case 'Nil':
        return patterns.Nil()
      case 'Cons':
        return patterns.Cons(x.indentation, x.document, x.pipeline)
      case 'UndoAnn':
        return patterns.UndoAnn(x.pipeline)
      default:
        return absurd(x as never)
    }
  }
  return f
}

// -------------------------------------------------------------------------------------
// layout algorithms
// -------------------------------------------------------------------------------------

const layoutWadlerLeijen = <A>(fits: FittingPredicate<A>, pageWidth: PageWidth) => (
  doc: Doc<A>
): SimpleDocStream<A> => {
  const initialIndentation: (stream: SimpleDocStream<A>) => Option<number> = SDS.fold({
    SFail: () => O.none,
    SEmpty: () => O.none,
    SChar: () => O.none,
    SText: () => O.none,
    SLine: (i) => O.some(i),
    SAnnPush: (_, s) => initialIndentation(s),
    SAnnPop: (s) => initialIndentation(s)
  })

  const selectNicer = (
    nestingLevel: number,
    currentColumn: number,
    x: SimpleDocStream<A>,
    y: SimpleDocStream<A>
  ): SimpleDocStream<A> => (fits(nestingLevel, currentColumn, initialIndentation(y), x) ? x : y)

  const best = (nl: number, cc: number): ((pipeline: LayoutPipeline<A>) => SimpleDocStream<A>) =>
    fold({
      Nil: () => SDS.SEmpty,
      Cons: (i, d, ds) =>
        pipe(
          d,
          D.fold<A, SDS.SimpleDocStream<A>>({
            Fail: () => SDS.SFail,
            Empty: () => pipe(ds, best(nl, cc)),
            Char: (c) => SDS.SChar(c, pipe(ds, best(nl, cc + 1))),
            Text: (t) => SDS.SText(t, pipe(ds, best(nl, cc + t.length))),
            Line: () => {
              const x = pipe(ds, best(i, i))
              const _i = x._tag === 'SEmpty' || x._tag === 'SLine' ? 0 : i
              return SDS.SLine(_i, x)
            },
            FlatAlt: (x) => pipe(Cons(i, x, ds), best(nl, cc)),
            Cat: (x, y) => pipe(Cons(i, x, Cons(i, y, ds)), best(nl, cc)),
            Nest: (j, x) => pipe(Cons(i + j, x, ds), best(nl, cc)),
            Union: (x, y) => {
              const _x = pipe(Cons(i, x, ds), best(nl, cc))
              const _y = pipe(Cons(i, y, ds), best(nl, cc))
              return selectNicer(nl, cc, _x, _y)
            },
            Column: (f) => pipe(Cons(i, f(cc), ds), best(nl, cc)),
            WithPageWidth: (f) => pipe(Cons(i, f(pageWidth), ds), best(nl, cc)),
            Nesting: (f) => pipe(Cons(i, f(i), ds), best(nl, cc)),
            Annotated: (ann, x) => SDS.SAnnPush(ann, pipe(Cons(i, x, UndoAnn(ds)), best(nl, cc)))
          })
        ),
      UndoAnn: (ds) => SDS.SAnnPop(pipe(ds, best(nl, cc)))
    })

  return pipe(Cons(0, doc, Nil), best(0, 0))
}

const failsOnFirstLine: <A>(stream: SDS.SimpleDocStream<A>) => boolean = SDS.fold({
  SFail: constTrue,
  SEmpty: constFalse,
  SChar: (_, s) => failsOnFirstLine(s),
  SText: (_, s) => failsOnFirstLine(s),
  SLine: constFalse,
  SAnnPush: (_, s) => failsOnFirstLine(s),
  SAnnPop: (s) => failsOnFirstLine(s)
})

/**
 * The `layoutUnbounded` layout algorithm will lay out a document an
 * `Unbounded` page width.
 *
 * @category layout algorithms
 * @since 0.0.1
 */
export const layoutUnbounded: <A>(doc: Doc<A>) => SimpleDocStream<A> = layoutWadlerLeijen(
  (_, __, ___, sds) => pipe(sds, not(failsOnFirstLine)),
  PW.Unbounded
)

/**
 * The `layoutPretty` layout algorithm is the default algorithm for rendering
 * documents.
 *
 * `layoutPretty` commites to rendering something in a certain way if the next
 * element fits the layout constrants. In other words, it has one `SimpleDocStream`
 * element lookahead when rendering. Consider using the smarter, but slightly
 * less performant `layoutSmart` layout algorithm if the results seem to run
 * off to the right before having lots of line breaks.
 *
 * @category layout algorithms
 * @since 0.0.1
 */
export const layoutPretty = <A>(doc: Doc<A>): Layout<A> => ({ pageWidth }) => {
  const fits: (width: number) => (stream: SimpleDocStream<A>) => boolean = (w) =>
    w < 0
      ? constFalse
      : SDS.fold({
          SFail: () => false,
          SEmpty: () => true,
          SChar: (_, x) => pipe(x, fits(w - 1)),
          SText: (t, x) => pipe(x, fits(w - t.length)),
          SLine: () => true,
          SAnnPush: (_, x) => pipe(x, fits(w)),
          SAnnPop: (x) => pipe(x, fits(w))
        })
  return pipe(
    pageWidth,
    PW.fold({
      AvailablePerLine: (lw, rfrac) =>
        pipe(
          doc,
          layoutWadlerLeijen(
            (nl, cc, _, sds) => pipe(sds, fits(PW.remainingWidth(lw, rfrac, nl, cc))),
            pageWidth
          )
        ),
      Unbounded: () => pipe(doc, layoutUnbounded)
    })
  )
}

/**
 * @category layout algorithms
 * @since 0.0.1
 */
export const layoutSmart = <A>(doc: Doc<A>): Layout<A> => ({ pageWidth }) =>
  pipe(
    pageWidth,
    PW.fold({
      AvailablePerLine: (lw, rfrac) => {
        const fits = (
          nl: number,
          cc: number,
          iy: Option<number>
        ): ((stream: SimpleDocStream<A>) => boolean) => {
          const availableWidth = PW.remainingWidth(lw, rfrac, nl, cc)

          const minNestingLevel = pipe(
            iy,
            O.fold(
              // y is definitely not a hanging layout - let's check x with
              // the same minNestingLevel that any subsequent lines with
              // the same indentation use
              () => cc,
              // y could be a (less wide) hanging layout - let's check x a
              // bit more thoroughly to make sure we do not misss a potentially
              // better fitting y
              (i) => Math.min(i, cc)
            )
          )

          const go: (width: number) => (stream: SimpleDocStream<A>) => boolean = (w) =>
            w < 0
              ? constFalse
              : SDS.fold({
                  SFail: () => false,
                  SEmpty: () => true,
                  SChar: (_, x) => pipe(x, go(w - 1)),
                  SText: (t, x) => pipe(x, go(w - t.length)),
                  SLine: (i, x) => (minNestingLevel < i ? pipe(x, go(lw - i)) : true),
                  SAnnPush: (_, x) => pipe(x, go(w)),
                  SAnnPop: (x) => pipe(x, go(w))
                })

          return go(availableWidth)
        }

        return pipe(
          doc,
          layoutWadlerLeijen((nl, cc, iy, sds) => pipe(sds, fits(nl, cc, iy)), pageWidth)
        )
      },
      Unbounded: () => pipe(doc, layoutUnbounded)
    })
  )

/**
 * @category layout algorithms
 * @since 0.0.1
 */
export const layoutCompact = <A, B>(doc: Doc<A>): SimpleDocStream<B> => {
  const scan = (col: number): ((docs: ReadonlyArray<Doc<A>>) => SimpleDocStream<B>) =>
    RA.foldLeft(
      () => SDS.SEmpty,
      (d, ds) =>
        pipe(
          d,
          D.fold({
            Fail: () => SDS.SFail,
            Empty: () => pipe(ds, scan(col)),
            Char: (c) => SDS.SChar(c, pipe(ds, scan(col + 1))),
            Text: (t) => SDS.SText(t, pipe(ds, scan(col + t.length))),
            FlatAlt: (x) => pipe(ds, RA.cons(x), scan(col)),
            Line: () => SDS.SLine(0, pipe(ds, scan(0))),
            Cat: (x, y) => pipe(ds, RA.cons(y), RA.cons(x), scan(col)),
            Nest: (_, x) => pipe(ds, RA.cons(x), scan(col)),
            Union: (_, y) => pipe(ds, RA.cons(y), scan(col)),
            Column: (f) => pipe(ds, RA.cons(f(col)), scan(col)),
            WithPageWidth: (f) => pipe(ds, RA.cons(f(PW.Unbounded)), scan(col)),
            Nesting: (f) => pipe(ds, RA.cons(f(0)), scan(col)),
            Annotated: (_, x) => pipe(ds, RA.cons(x), scan(col))
          })
        )
    )
  return pipe(RA.of(doc), scan(0))
}
