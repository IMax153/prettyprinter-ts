/**
 * The abstract data type `Doc` represents prettified documents that
 * have been annotated with data of type `A`.
 *
 * More specifically, a value of type `Doc` represents a non-empty
 * set of possible layouts for a given document. The layout algorithms
 * select one of these possibilities, taking into account variables
 * such as the width of the document.
 *
 * The annotation is an arbitrary piece of data associated with (part
 * of) a document. Annotations may be used by rendering algorithms to
 * display documents differently by providing information such as:
 *
 * - color information (e.g., when rendering to the terminal)
 * - mouseover text (e.g., when rendering to rich HTML)
 * - whether to show something or not (to allow simple or detailed versions)
 *
 * The simplest way to display a `Doc` is via its `Show` instance.
 *
 * @example
 * import * as D from 'prettyprinter-ts/lib/Doc'
 *
 * console.log(D.showDoc.show(D.vsep([D.text("hello"), D.text("world")])))
 * // hello
 * // world
 *
 * @since 0.0.1
 */
import { absurd, constant, flow, pipe } from 'fp-ts/function'
import type { Functor1 } from 'fp-ts/Functor'
import type { Monoid } from 'fp-ts/Monoid'
import * as M from 'fp-ts/Monoid'
import * as RA from 'fp-ts/ReadonlyArray'
import type { Semigroup } from 'fp-ts/Semigroup'

import * as F from './Flatten'
import type { PageWidth } from './PageWidth'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.0.1
 */
export type Doc<A> =
  | Fail
  | Empty
  | Char
  | Text
  | Line
  | FlatAlt<A>
  | Cat<A>
  | Nest<A>
  | Union<A>
  | Column<A>
  | WithPageWidth<A>
  | Nesting<A>
  | Annotated<A>

/**
 * Represents a document that cannot be rendered. Generally occurs when
 * flattening a line. The layout algorithms will reject this document
 * and choose a more suitable rendering.
 *
 * @category model
 * @since 0.0.1
 */
export interface Fail {
  readonly _tag: 'Fail'
}

/**
 * Represents the empty document. Conceptually, the unit of `Cat`.
 *
 * @category model
 * @since 0.0.1
 */
export interface Empty {
  readonly _tag: 'Empty'
}

/**
 * Represents a document containing a single character.
 *
 * **Invariants**
 * - Cannot be the newline (`"\n"`) character
 *
 * @category model
 * @since 0.0.1
 */
export interface Char {
  readonly _tag: 'Char'
  readonly char: string
}

/**
 * Represents a document containing a string of text.
 *
 * **Invariants**
 * - Text cannot be less than two characters long
 * - Text cannot contain a newline (`"\n"`) character
 *
 * @category model
 * @since 0.0.1
 */
export interface Text {
  readonly _tag: 'Text'
  readonly text: string
}

/**
 * Represents a document that contains a hard line break.
 *
 * @category model
 * @since 0.0.1
 */
export interface Line {
  readonly _tag: 'Line'
}

/**
 * Represents a flattened alternative of two documents. The
 * layout algorithms will choose the first document, but when
 * flattened (via `group`) the second document will be preferred.
 *
 * The layout algorithms operate under the assumption that the
 * first alternative is less wide than the flattened second
 * alternative.
 *
 * @category model
 * @since 0.0.1
 */
export interface FlatAlt<A> {
  readonly _tag: 'FlatAlt'
  readonly x: Doc<A>
  readonly y: Doc<A>
}

/**
 * Represents the concatenation of two documents.
 *
 * @category model
 * @since 0.0.1
 */
export interface Cat<A> {
  readonly _tag: 'Cat'
  readonly x: Doc<A>
  readonly y: Doc<A>
}

/**
 * Represents a document that is indented by a certain
 * number of columns.
 *
 * @category model
 * @since 0.0.1
 */
export interface Nest<A> {
  readonly _tag: 'Nest'
  readonly indent: number
  readonly doc: Doc<A>
}

/**
 * Represents the union of two documents. Used to implement
 * layout alternatives for `group`.
 *
 * **Invariants**
 * - The first lines of the first document should be longer
 * than the first lines of the second document so that the
 * layout algorithm can pick the document with the best fit
 *
 * @category model
 * @since 0.0.1
 */
export interface Union<A> {
  readonly _tag: 'Union'
  readonly x: Doc<A>
  readonly y: Doc<A>
}

/**
 * Represents a document that reacts to the current cursor
 * position.
 *
 * @category model
 * @since 0.0.1
 */
export interface Column<A> {
  readonly _tag: 'Column'
  readonly react: (position: number) => Doc<A>
}

/**
 * Represents a document that reacts to the current page width.
 * @category model
 * @since 0.0.1
 */
export interface WithPageWidth<A> {
  readonly _tag: 'WithPageWidth'
  readonly react: (pageWidth: PageWidth) => Doc<A>
}

/**
 * Represents a document that reacts to the current nesting level.
 * @category model
 * @since 0.0.1
 */
export interface Nesting<A> {
  readonly _tag: 'Nesting'
  readonly react: (level: number) => Doc<A>
}

/**
 * Represents a document with an associated annotation.
 *
 * @category model
 * @since 0.0.1
 */
export interface Annotated<A> {
  readonly _tag: 'Annotated'
  readonly annotation: A
  readonly doc: Doc<A>
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 0.0.1
 */
export const Fail: Doc<never> = {
  _tag: 'Fail'
}

/**
 * @category constructors
 * @since 0.0.1
 */
export const Empty: Doc<never> = {
  _tag: 'Empty'
}

/**
 * @category constructors
 * @since 0.0.1
 */
export const Char = <A>(char: string): Doc<A> => ({
  _tag: 'Char',
  char
})

/**
 * @category constructors
 * @since 0.0.1
 */
export const Text = <A>(text: string): Doc<A> => ({
  _tag: 'Text',
  text
})

/**
 * @category constructors
 * @since 0.0.1
 */
export const Line: Doc<never> = {
  _tag: 'Line'
}

/**
 * @category constructors
 * @since 0.0.1
 */
export const FlatAlt = <A>(x: Doc<A>, y: Doc<A>): Doc<A> => ({
  _tag: 'FlatAlt',
  x,
  y
})

/**
 * @category constructors
 * @since 0.0.1
 */
export const Cat = <A>(x: Doc<A>, y: Doc<A>): Doc<A> => ({
  _tag: 'Cat',
  x,
  y
})

/**
 * @category constructors
 * @since 0.0.1
 */
export const Nest = <A>(indent: number, doc: Doc<A>): Doc<A> => ({
  _tag: 'Nest',
  indent,
  doc
})

/**
 * @category constructors
 * @since 0.0.1
 */
export const Union = <A>(x: Doc<A>, y: Doc<A>): Doc<A> => ({
  _tag: 'Union',
  x,
  y
})

/**
 * @category constructors
 * @since 0.0.1
 */
export const Column = <A>(react: (position: number) => Doc<A>): Doc<A> => ({
  _tag: 'Column',
  react
})

/**
 * @category constructors
 * @since 0.0.1
 */
export const WithPageWidth = <A>(react: (pageWidth: PageWidth) => Doc<A>): Doc<A> => ({
  _tag: 'WithPageWidth',
  react
})

/**
 * @category constructors
 * @since 0.0.1
 */
export const Nesting = <A>(react: (level: number) => Doc<A>): Doc<A> => ({
  _tag: 'Nesting',
  react
})

/**
 * @category constructors
 * @since 0.0.1
 */
export const Annotated = <A>(annotation: A, doc: Doc<A>): Doc<A> => ({
  _tag: 'Annotated',
  annotation,
  doc
})

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

export const fold = <A, R>(patterns: {
  readonly Fail: () => R
  readonly Empty: () => R
  readonly Char: (char: string) => R
  readonly Text: (text: string) => R
  readonly Line: () => R
  readonly FlatAlt: (x: Doc<A>, y: Doc<A>) => R
  readonly Cat: (x: Doc<A>, y: Doc<A>) => R
  readonly Nest: (indent: number, doc: Doc<A>) => R
  readonly Union: (x: Doc<A>, y: Doc<A>) => R
  readonly Column: (react: (position: number) => Doc<A>) => R
  readonly WithPageWidth: (react: (pageWidth: PageWidth) => Doc<A>) => R
  readonly Nesting: (react: (level: number) => Doc<A>) => R
  readonly Annotated: (annotation: A, doc: Doc<A>) => R
}): ((doc: Doc<A>) => R) => {
  const f = (x: Doc<A>): R => {
    switch (x._tag) {
      case 'Fail':
        return patterns.Fail()
      case 'Empty':
        return patterns.Empty()
      case 'Char':
        return patterns.Char(x.char)
      case 'Text':
        return patterns.Text(x.text)
      case 'Line':
        return patterns.Line()
      case 'FlatAlt':
        return patterns.FlatAlt(x.x, x.y)
      case 'Cat':
        return patterns.Cat(x.x, x.y)
      case 'Nest':
        return patterns.Nest(x.indent, x.doc)
      case 'Union':
        return patterns.Union(x.x, x.y)
      case 'Column':
        return patterns.Column(x.react)
      case 'WithPageWidth':
        return patterns.WithPageWidth(x.react)
      case 'Nesting':
        return patterns.Nesting(x.react)
      case 'Annotated':
        return patterns.Annotated(x.annotation, x.doc)
      default:
        return absurd(x)
    }
  }
  return f
}

// -------------------------------------------------------------------------------------
// primitive combinators
// -------------------------------------------------------------------------------------

/**
 * A document containing a single `'` character.
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const squote: Doc<never> = Char("'")

/**
 * A document containing a single `"` character.
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const dquote: Doc<never> = Char('"')

/**
 * A document containing a single `(` character.
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const lparen: Doc<never> = Char('(')

/**
 * A document containing a single `)` character.
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const rparen: Doc<never> = Char(')')

/**
 * A document containing a single `<` character.
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const langle: Doc<never> = Char('<')

/**
 * A document containing a single `>` character.
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const rangle: Doc<never> = Char('>')

/**
 * A document containing a single `[` character.
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const lbracket: Doc<never> = Char('[')

/**
 * A document containing a single `]` character.
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const rbracket: Doc<never> = Char(']')

/**
 * A document containing a single `{` character.
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const lbrace: Doc<never> = Char('{')

/**
 * A document containing a single `}` character.
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const rbrace: Doc<never> = Char('}')

/**
 * A document containing a single `;` character.
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const semi: Doc<never> = Char(';')

/**
 * A document containing a single `:` character.
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const colon: Doc<never> = Char(':')

/**
 * A document containing a single `,` character.
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const comma: Doc<never> = Char(',')

/**
 * A document containing a single `.` character.
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const dot: Doc<never> = Char('.')

/**
 * A document containing a single `/` character.
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const slash: Doc<never> = Char('/')

/**
 * A document containing a single `\` character.
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const backslash: Doc<never> = Char('\\')

/**
 * A document containing a single `=` character.
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const equals: Doc<never> = Char('=')

/**
 * A document containing a single `|` character.
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const vbar: Doc<never> = Char('|')

/**
 * A document containing a single ` ` character.
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const space: Doc<never> = Char(' ')

/**
 * A document that cannot be rendered.
 *
 * Generally occurs when flattening a line. The layout algorithms will
 * reject this document and choose a more suitable rendering.
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const fail: Doc<never> = Fail

/**
 * The empty document behaves like a document containing the empty string
 * (`""`), so it has a height of `1`.
 *
 * This may lead to surprising behavior if the empty document is expected
 * to bear no weight inside certain layout functions, such as`vcat`, where
 * it will render an empty line of output.
 *
 * @example
 * import * as D from 'prettyprinter-ts/lib/Doc'
 *
 * const doc =D.vsep([
 *   D.text('hello'),
 *   D.parens(D.empty), // `parens` for visibility purposes only
 *   D.text('world')
 * ])
 *
 * console.log(D.showDoc.show(doc))
 * // hello
 * // ()
 * // world
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const empty: Doc<never> = Empty

/**
 * A document containing a single character.
 *
 * **Invariants**
 * - Cannot be the newline (`"\n"`) character
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const char: <A>(char: string) => Doc<A> = Char

/**
 * A document containing a string of text.
 *
 * **Invariants**
 * - Text cannot be less than two characters long
 * - Text cannot contain a newline (`"\n"`) character
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const text: <A>(text: string) => Doc<A> = Text

/**
 * The `line` document advances to the next line and indents to the
 * current nesting level.
 *
 * `line` behaves like `space` if the line break is undone by `group`.
 *
 * @example
 * import * as D from 'prettyprinter-ts/lib/Doc'
 *
 * const doc = D.hcat([
 *   D.text('lorem ipsum'),
 *   D.line,
 *   D.text('dolor sit amet')
 * ])
 *
 * console.log(D.showDoc.show(doc))
 * // lorem ipsum
 * // dolor sit amet
 *
 * console.log(D.showDoc.show(D.group(doc)))
 * // lorem ipsum dolor sit amet
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const line: Doc<never> = FlatAlt(Line, Char(' '))

/**
 * The `lineBreak` document is like `line` but behaves like `empty` if the
 * line break is undone by `group` (instead of `space`).
 *
 * @example
 * import * as D from 'prettyprinter-ts/lib/Doc'
 *
 * const doc = D.hcat([
 *   D.text('lorem ipsum'),
 *   D.lineBreak,
 *   D.text('dolor sit amet')
 * ])
 *
 * console.log(D.showDoc.show(doc))
 * // lorem ipsum
 * // dolor sit amet
 *
 * console.log(D.showDoc.show(D.group(doc)))
 * // lorem ipsumdolor sit amet
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const lineBreak: Doc<never> = FlatAlt(Line, Empty)

/**
 * The `softLine` document behaves like `space` if the resulting output
 * fits onto the page, otherwise it behaves like `line`.
 *
 * @example
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as L from 'prettyprinter-ts/lib/Layout'
 * import * as PW from 'prettyprinter-ts/lib/PageWidth'
 *
 * // Here we have enough space to put everything onto one line:
 *
 * const doc = D.hcat([
 *   D.text('lorem ipsum'),
 *   D.softLine,
 *   D.text('dolor sit amet')
 * ])
 *
 * console.log(pipe(doc, L.pretty(PW.AvailablePerLine(80, 1))))
 * // lorem ipsum dolor sit amet
 *
 * // If the page width is narrowed to `10`, the layout algorithm will
 * // introduce a line break:
 *
 * console.log(pipe(doc, L.pretty(PW.AvailablePerLine(10, 1))))
 * // lorem ipsum
 * // dolor sit amet
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const softLine: Doc<never> = Union(Char(' '), Line)

/**
 * The `softLineBreak` document is similar to `softLine`, but behaves
 * like `empty` if the resulting output does not fit onto the page
 * (instead of `space`).
 *
 * @example
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as L from 'prettyprinter-ts/lib/Layout'
 * import * as PW from 'prettyprinter-ts/lib/PageWidth'
 *
 * // With enough space, we get direct concatenation of documents:
 *
 * const doc = D.hcat([
 *   D.text('ThisText'),
 *   D.softLineBreak,
 *   D.text('IsWayTooLong')
 * ])
 *
 * console.log(pipe(doc, L.pretty(PW.AvailablePerLine(80, 1))))
 * // ThisTextIsWayTooLong
 *
 * // If the page width is narrowed to `10`, the layout algorithm will
 * // introduce a line break:
 *
 * console.log(pipe(doc, L.pretty(PW.AvailablePerLine(10, 1))))
 * // ThisText
 * // IsWayTooLong
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const softLineBreak: Doc<never> = Union(Empty, Line)

/**
 * The `hardLine` document is always laid out as a line break,
 * regardless of space or whether or not the document was
 * `group`'ed.
 *
 * @example
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as L from 'prettyprinter-ts/lib/Layout'
 * import * as PW from 'prettyprinter-ts/lib/PageWidth'
 *
 * const doc = D.hcat([
 *   D.text('lorem ipsum'),
 *   D.hardLine,
 *   D.text('dolor sit amet')
 * ])
 *
 * console.log(pipe(doc, L.pretty(PW.AvailablePerLine(1000, 1))))
 * // lorem ipsum
 * // dolor sit amet
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const hardLine: Doc<never> = Line

/**
 * @category primitive combinators
 * @since 0.0.1
 */
export const nest = (indent: number) => <A>(doc: Doc<A>): Doc<A> =>
  indent === 0 ? doc : Nest(indent, doc)

// -------------------------------------------------------------------------------------
// alternative combinators
// -------------------------------------------------------------------------------------

/**
 * @category alternative combinators
 * @since 0.0.1
 */
export const group = <A>(doc: Doc<A>): Doc<A> => {
  const group_ = (a: Doc<A>): Doc<A> =>
    pipe(
      F.changesUponFlattening(a),
      F.fold({
        Flattened: (b) => Union(b, a),
        AlreadyFlat: () => a,
        NeverFlat: () => a
      })
    )
  return pipe(
    doc,
    fold({
      Fail: () => group_(doc),
      Empty: () => group_(doc),
      Char: () => group_(doc),
      Text: () => group_(doc),
      Line: () => group_(doc),
      FlatAlt: (a, b) =>
        pipe(
          F.changesUponFlattening(b),
          F.fold({
            Flattened: (b_) => Union(b_, a),
            AlreadyFlat: () => Union(b, a),
            NeverFlat: () => a
          })
        ),
      Cat: () => group_(doc),
      Nest: () => group_(doc),
      Union: () => doc,
      Column: () => group_(doc),
      WithPageWidth: () => group_(doc),
      Nesting: () => group_(doc),
      Annotated: () => group_(doc)
    })
  )
}

/**
 * The `flatAlt` document will render as `x` by default. However, when
 * `group`ed, `y` will be preferred with `x` as the fallback for cases
 * where `y` does not fit onto the page.
 *
 * @example
 * import * as D from 'prettyprinter-ts/lib/Doc'
 *
 * const doc = pipe(D.char('a'), D.flatAlt(D.char('b')))
 * // TODO
 *
 *
 * @category alternative combinators
 * @since 0.0.1
 */
export const flatAlt = <A>(x: Doc<A>) => (y: Doc<A>): Doc<A> => FlatAlt(x, y)

// -------------------------------------------------------------------------------------
// alignment combinators
// -------------------------------------------------------------------------------------

/**
 * @category alignment combinators
 * @since 0.0.1
 */
export const align = <A>(doc: Doc<A>): Doc<A> => column((k) => nesting((i) => nest(k - i)(doc)))

/**
 * @category alignment combinators
 * @since 0.0.1
 */
export const hang = (indent: number): (<A>(doc: Doc<A>) => Doc<A>) => flow(nest(indent), align)

/**
 * @category alignment combinators
 * @since 0.0.1
 */
export const indent = (indent: number) => <A>(doc: Doc<A>): Doc<A> =>
  hang(indent)(Cat(spaces(indent), doc))

/**
 * @category alignment combinators
 * @since 0.0.1
 */
export const encloseSep = <A>(left: Doc<A>, right: Doc<A>, sep: Doc<A>) => (
  docs: ReadonlyArray<Doc<A>>
): Doc<A> => {
  if (docs.length === 0) return Cat(left, right)
  if (docs.length === 1) return Cat(left, Cat(docs[0], right))
  const xs = RA.zipWith(pipe(RA.replicate(docs.length - 1, sep), RA.cons(left)), docs, Cat)
  return Cat(cat(xs), right)
}

/**
 * A Haskell-inspired variant of `encloseSep` that uses a comma as the separator and
 * braces as the enclosure for a list of documents.
 *
 * @example
 * // TODO examples
 *
 * @category alignment combinators
 * @since 0.0.1
 */
export const list = <A>(docs: ReadonlyArray<Doc<A>>): Doc<A> =>
  pipe(
    docs,
    encloseSep(flatAlt<A>(Char('[ '))(lbracket), flatAlt<A>(Char(' ]'))(rbracket), Char(', ')),
    group
  )

/**
 * A Haskell-inspired variant of `encloseSep` that uses a comma as the separator and
 * parentheses as the enclosure for a list of documents.
 *
 * @category alignment combinators
 * @since 0.0.1
 */
export const tupled = <A>(docs: ReadonlyArray<Doc<A>>): Doc<A> =>
  pipe(
    docs,
    encloseSep(flatAlt<A>(Char('( '))(lparen), flatAlt<A>(Char(' )'))(rparen), Char(', ')),
    group
  )

// -------------------------------------------------------------------------------------
// reactive/conditional combinators
// -------------------------------------------------------------------------------------

/**
 * @category reactive/conditional combinators
 * @since 0.0.1
 */
export const column: <A>(react: (position: number) => Doc<A>) => Doc<A> = Column

/**
 * @category reactive/conditional combinators
 * @since 0.0.1
 */
export const nesting: <A>(react: (level: number) => Doc<A>) => Doc<A> = Nesting

/**
 * @category reactive/conditional combinators
 * @since 0.0.1
 */
export const width = <A>(react: (width: number) => Doc<A>) => (doc: Doc<A>): Doc<A> =>
  column((colStart) =>
    Cat(
      doc,
      column((colEnd) => react(colEnd - colStart))
    )
  )

/**
 * @category reactive/conditional combinators
 * @since 0.0.1
 */
export const pageWidth: <A>(react: (pageWidth: PageWidth) => Doc<A>) => Doc<A> = WithPageWidth

// -------------------------------------------------------------------------------------
// concatenation combinators
// -------------------------------------------------------------------------------------

/**
 * The `concatWith` combinator concatenates all documents in a list element-wise with
 * a binary function.
 *
 * @example
 * // TODO examples
 *
 * @category concatenation combinators
 * @since 0.0.1
 */
export const concatWith: <A>(
  f: (x: Doc<A>, y: Doc<A>) => Doc<A>
) => (docs: ReadonlyArray<Doc<A>>) => Doc<A> = (f) =>
  RA.foldRight(
    () => empty,
    (init, last) => pipe(init, RA.reduceRight(last, f))
  )

/**
 * The `appendWithSpace` combinator concatenates two documents, `x` and `y`, with a
 * `space` between them.
 *
 * @example
 * // TODO examples
 *
 * @category concatenation combinators
 * @since 0.0.1
 */
export const appendWithSpace: <A>(x: Doc<A>, y: Doc<A>) => Doc<A> = (x, y) => Cat(x, Cat(space, y))

/**
 * The `appendWithLine` combinator concatenates two documents, `x` and `y`, with a
 * `line` between them.
 *
 * @example
 * // TODO examples
 *
 * @category concatenation combinators
 * @since 0.0.1
 */
export const appendWithLine: <A>(x: Doc<A>, y: Doc<A>) => Doc<A> = (x, y) => Cat(x, Cat(line, y))

/**
 * The `appendWithLineBreak` combinator concatenates two documents, `x` and `y`, with a
 * `lineBreak` between them.
 *
 * @example
 * // TODO examples
 *
 * @category concatenation combinators
 * @since 0.0.1
 */
export const appendWithLineBreak: <A>(x: Doc<A>, y: Doc<A>) => Doc<A> = (x, y) =>
  Cat(x, Cat(lineBreak, y))

/**
 * The `appendWithSoftLine` combinator concatenates two documents, `x` and `y`, with a
 * `softLine` between them.
 *
 * @example
 * // TODO examples
 *
 * @category concatenation combinators
 * @since 0.0.1
 */
export const appendWithSoftLine: <A>(x: Doc<A>, y: Doc<A>) => Doc<A> = (x, y) =>
  Cat(x, Cat(softLine, y))

/**
 * The `appendWithSoftLineBreak` combinator concatenates two documents, `x` and `y`, with a
 * `softLineBreak` between them.
 *
 * @example
 * // TODO examples
 *
 * @category concatenation combinators
 * @since 0.0.1
 */
export const appendWithSoftLineBreak: <A>(x: Doc<A>, y: Doc<A>) => Doc<A> = (x, y) =>
  Cat(x, Cat(softLineBreak, y))

// -------------------------------------------------------------------------------------
// sep combinators
// -------------------------------------------------------------------------------------

/**
 * The `hsep` combinator concatenates all documents in a list horizontally by placing
 * a `space` between each pair of documents.
 *
 * For automatic line breaks, consider using `fillSep` instead.
 *
 * @example
 * // TODO examples
 *
 *
 * @category sep combinators
 * @since 0.0.1
 */
export const hsep: <A>(docs: ReadonlyArray<Doc<A>>) => Doc<A> = concatWith(appendWithSpace)

/**
 * The `vsep` combinator concatenates all documents in a list vertically. If a `group`
 * undoes the line breaks inserted by `vsep`, the documents are separated with a space
 * instead.
 *
 * Using `vsep` alone yields:
 *
 * @example
 * // TODO examples
 *
 * // However, `group`ing a `vsep` separates the doucments with a `space` if they fit the
 * // page (and does nothing otherwise). See the `sep` convenience function for this use
 * // case.
 *
 * // The `align` function can be used to align the documents under their first element
 * // TODO examples
 *
 * @category sep combinators
 * @since 0.0.1
 */
export const vsep: <A>(docs: ReadonlyArray<Doc<A>>) => Doc<A> = concatWith(appendWithLine)

/**
 * The `fillSep` combinator concatenates all documents in a list horizontally by placing
 * a `space` between each pair of documents as long as they fit the page. Once the page
 * width is exceeded, a `line` is inserted and the process is repeated for all documents
 * in the list. **Note** that the use of `line` means that if `group`ed, the documents
 * will be separated with a `space` instead of newlines. See `fillCat` if you do not want
 * a `space`.
 *
 * As an example, let's print some words to fill the line:
 *
 * @example
 * // TODO examples
 *
 * // Printing the same document with a width of only 40 yields
 * // TODO examples
 *
 * @category sep combinators
 * @since 0.0.1
 */
export const fillSep: <A>(docs: ReadonlyArray<Doc<A>>) => Doc<A> = concatWith(appendWithSoftLine)

/**
 * The `sep` combinator will attempt to lay out a list of documents separated by `space`s.
 * If the output does not fit the page, then the documents will be separated by newlines.
 * This is what differentiates it from `vsep`, which always lays out documents beneath one
 * another.
 *
 * @example
 * // TODO examples
 *
 * // When there is not enough space, the documents are separated by newlines
 * // TODO examples
 *
 * @category sep combinators
 * @since 0.0.1
 */
export const sep: <A>(docs: ReadonlyArray<Doc<A>>) => Doc<A> = flow(vsep, group)

// -------------------------------------------------------------------------------------
// cat combinators
// -------------------------------------------------------------------------------------

/**
 * The `hcat` combinator concatenates all documents in a list horizontally without
 * any spacing. It is provided for completeness, but is identical in function to
 * the `Semigroup` instance for `Doc`.
 *
 * @example
 * // TODO examples
 *
 * @category cat combinators
 * @since 0.0.1
 */
export const hcat: <A>(docs: ReadonlyArray<Doc<A>>) => Doc<A> = concatWith(Cat)

/**
 * The `vcat` combinator concatenates all documents in a list vertically. If the
 * output is grouped then the line breaks are removed.
 *
 * @example
 * // TODO examples
 *
 * @see `cat` - built-in shortcut for a `vcat` followed by a `group`
 * @category cat combinators
 * @since 0.0.1
 */
export const vcat: <A>(docs: ReadonlyArray<Doc<A>>) => Doc<A> = concatWith(appendWithLineBreak)

/**
 * The `fillCat` combinator concatenates all documents in a list horizontally by placing
 * a `space` between each pair of documents as long as they fit the page. Once the page
 * width is exceeded, a `lineBreak` is inserted and the process is repeated for all
 * documents in the list.
 *
 * **Note** that the use of `lineBreak` means that if `group`ed, the documents will be
 * separated with `empty` instead of newlines. See `fillSep` if you want a `space` instead.
 *
 * @example
 * // TODO examples
 *
 * @category cat combinators
 * @since 0.0.1
 */
export const fillCat: <A>(docs: ReadonlyArray<Doc<A>>) => Doc<A> = concatWith(
  appendWithSoftLineBreak
)

/**
 * The `cat` combinator will attempt to lay out a list of documents separated by nothing.
 * If the output does not fit the page, then the documents will be separated by newlines.
 * This is what differentiates it from `vcat`, which always lays out documents beneath one
 * another.
 *
 * @example
 * // TODO examples
 *
 * // When there is not enough space, the documents are separated by newlines
 * // TODO examples
 *
 * @category cat combinators
 * @since 0.0.1
 */
export const cat: <A>(docs: ReadonlyArray<Doc<A>>) => Doc<A> = flow(vcat, group)

// -------------------------------------------------------------------------------------
// filler combinators
// -------------------------------------------------------------------------------------

/**
 * The `fill` combinator first lays out the document `x` and then appends `space`s
 * until the width of the document is equal to the specified `width`. If the width
 * of `x` is already larger than the specified `width`, nothing is appended.
 *
 * @example
 * // TODO examples
 *
 * @category filler combinators
 * @since 0.0.1
 */
export const fill: (width: number) => <A>(doc: Doc<A>) => Doc<A> = (n) => (x) =>
  pipe(
    x,
    width((w) => spaces(n - w))
  )

/**
 * The `fillBreak` combinator first lays out the document `x` and then appends `space`s
 * until the width of the document is equal to the specified `width`. If the width of
 * `x` is already larger than the specified `width`, the nesting level is increased by
 * the specified `width` and a `line` is appended.
 *
 * @example
 * // TODO examples
 *
 * @category filler combinators
 * @since 0.0.1
 */
export const fillBreak: (width: number) => <A>(doc: Doc<A>) => Doc<A> = (n) => (x) =>
  pipe(
    x,
    width((w) => (w > n ? nest(n)(lineBreak) : spaces(n - w)))
  )

// -------------------------------------------------------------------------------------
// general combinators
// -------------------------------------------------------------------------------------

/**
 * The `punctuate` combinator appends the `punctuator` document to all by the last
 * document in a list of documents. The separators are places after the document
 * entries, which can be observed if the result is oriented vertically.
 *
 * @example
 * // TODO examples - vertical one
 *
 * @category general combinators
 * @since 0.0.1
 */
export const punctuate = <A>(punctuator: Doc<A>) => (
  docs: ReadonlyArray<Doc<A>>
): ReadonlyArray<Doc<A>> =>
  pipe(
    docs,
    RA.mapWithIndex((i, x) => (docs.length - 1 === i ? x : Cat(x, punctuator)))
  )

/**
 * The `enclose` combinator encloses a document `x` in between `left` and `right`
 * documents using `Cat`.
 *
 * @example
 * // TODO examples
 *
 * @category general combinators
 * @since 0.0.1
 */
export const enclose = <A>(left: Doc<A>, right: Doc<A>) => (doc: Doc<A>): Doc<A> =>
  Cat(left, Cat(doc, right))

/**
 * The `surround` combinator surrounds a document `x` in between `left` and `right`
 * documents using `Cat`.
 *
 * `surround` is merely a reordering of the arguments to `enclose`, but allows for
 * useful definitions such as:
 *
 * @example
 * // TODO examples
 *
 * @category general combinators
 * @since 0.0.1
 */
export const surround = <A>(doc: Doc<A>) => (left: Doc<A>, right: Doc<A>): Doc<A> =>
  Cat(left, Cat(doc, right))

/**
 * @category general combinators
 * @since 0.0.1
 */
export const spaces = <A>(n: number): Doc<A> => {
  switch (n) {
    case 0:
      return Empty
    case 1:
      return Char(' ')
    default:
      return Text(textSpaces(n))
  }
}

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const map_: Functor1<URI>['map'] = (fa, f) => pipe(fa, map(f))

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @category Functor
 * @since 0.0.1
 */
export const map: <A, B>(f: (a: A) => B) => (fa: Doc<A>) => Doc<B> = (f) => reAnnotate(f)

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 0.0.1
 */
export const URI = 'prettyprinter-ts/Doc'

/**
 * @category instances
 * @since 0.0.1
 */
export type URI = typeof URI

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Doc<A>
  }
}

/**
 * @category instances
 * @since 0.0.1
 */
export const getSemigroup = <A>(): Semigroup<Doc<A>> => ({
  concat: Cat
})

/**
 * @category instances
 * @since 0.0.1
 */
export const getMonoid = <A>(): Monoid<Doc<A>> => ({
  ...getSemigroup<A>(),
  empty: Empty
})

/**
 * @category instances
 * @since 0.0.1
 */
export const Functor: Functor1<URI> = {
  URI,
  map: map_
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * Change the annotations of a document. Individual annotations can be
 * removed, changed, or replaced by multiple ones.
 *
 * This is a general function that combines `unAnnotate` and `reAnnotate`,
 * and is useful for mapping semantic annotations (such as »this is a keyword«)
 * to display annotations (such as »this is red and underlined«) because some
 * backends may not care about certain annotations while others may.
 *
 * Annotations earlier in the new list will be applied earlier, so returning
 * `[Bold, Green]` will result in a bold document that contains green text,
 * and not vice versa.
 *
 * Since this traverses the entire document tree, including the parts that are
 * not rendered (due to other layouts having better fit), it is preferable to
 * reannotate a document **after** producing the layout by using
 * `alterAnnotationsS` from the `SimpleDocStream` module.
 *
 * @category utils
 * @since 0.0.1
 */
export const alterAnnotations = <A, B>(
  f: (a: A) => ReadonlyArray<B>
): ((doc: Doc<A>) => Doc<B>) => {
  const go: (x: Doc<A>) => Doc<B> = fold<A, Doc<B>>({
    Fail: () => Fail,
    Empty: () => Empty,
    Char: (c) => Char(c),
    Text: (t) => Text(t),
    Line: () => Line,
    FlatAlt: (x, y) => FlatAlt(go(x), go(y)),
    Cat: (x, y) => Cat(go(x), go(y)),
    Nest: (i, x) => Nest(i, go(x)),
    Union: (x, y) => Union(go(x), go(y)),
    Column: (f) => Column(flow(f, go)),
    WithPageWidth: (f) => WithPageWidth(flow(f, go)),
    Nesting: (f) => Nesting(flow(f, go)),
    Annotated: (ann, x) => pipe(f(ann), RA.reduceRight(go(x), Annotated))
  })
  return go
}

/**
 * Adds an annotation to a `Doc`. The annotation can then be used by the rendering
 * algorithm to, for example, add color to certain parts of the output.
 *
 * **Note** This function is relevant only for custom formats with their own annotations,
 * and is not relevant for basic pretty printing.
 *
 * @category utils
 * @since 0.0.1
 */
export const annotate: <A>(annotation: A) => (doc: Doc<A>) => Doc<A> = (ann) => (x) =>
  Annotated(ann, x)

/**
 * Removes all annotations from a document.
 *
 * **Note** that with each invocation, the entire document tree is traversed.
 * If possible, it is preferable to unannotate a document after producing the
 * layout using `unAnnotateS`.
 *
 * @example
 * // TODO examples
 *
 * @category utils
 * @since 0.0.1
 */
export const unAnnotate: <A>(doc: Doc<A>) => Doc<never> = alterAnnotations(constant([]))

/**
 * Changes the annotation of a document. Useful for modifying documents embedded
 * with one form of annotation with a more general annotation.
 *
 * **Note** that with each invocation, the entire document tree is traversed.
 * If possible, it is preferable to reannotate a document after producing the
 * layout using `reAnnotateS`.
 *
 * @example
 * // TODO examples
 *
 * @category utils
 * @since 0.0.1
 */
export const reAnnotate: <A, B>(f: (a: A) => B) => (doc: Doc<A>) => Doc<B> = (f) =>
  alterAnnotations(flow(f, RA.of))

/**
 * @category utils
 * @since 0.0.1
 */
export const textSpaces = (n: number): string => pipe(RA.replicate(n, ' '), M.fold(M.monoidString))
