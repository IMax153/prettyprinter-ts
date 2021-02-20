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
 *
 * @category model
 * @since 0.0.1
 */
export interface WithPageWidth<A> {
  readonly _tag: 'WithPageWidth'
  readonly react: (pageWidth: PageWidth) => Doc<A>
}

/**
 * Represents a document that reacts to the current nesting level.
 *
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

/**
 * @category destructors
 * @since 0.0.1
 */
export const match = <A, R>(patterns: {
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
 * Encloses the input document in parentheses (`()`).
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const parens = <A>(doc: Doc<A>): Doc<A> => pipe(doc, enclose<A>(lparen, rparen))

/**
 * Encloses the input document in angle brackets (`<>`).
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const angles = <A>(doc: Doc<A>): Doc<A> => pipe(doc, enclose<A>(langle, rangle))

/**
 * Encloses the input document in brackets (`[]`).
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const brackets = <A>(doc: Doc<A>): Doc<A> => pipe(doc, enclose<A>(lbracket, rbracket))

/**
 * Encloses the input document in braces (`{}`).
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const braces = <A>(doc: Doc<A>): Doc<A> => pipe(doc, enclose<A>(lbrace, rbrace))

/**
 * Encloses the input document in single quotes (`''`).
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const squotes = <A>(doc: Doc<A>): Doc<A> => pipe(doc, enclose<A>(squote, squote))

/**
 * Encloses the input document in double quotes (`""`).
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const dquotes = <A>(doc: Doc<A>): Doc<A> => pipe(doc, enclose<A>(dquote, dquote))

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
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.vsep([
 *   D.text('hello'),
 *   D.parens(D.empty), // `parens` for visibility purposes only
 *   D.text('world')
 * ])
 *
 * console.log(R.render(doc))
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
 * current nesting level. However, `line` will behave like `space`
 * if the line break is undone by `group`.
 *
 * @example
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.hcat([
 *   D.text('lorem ipsum'),
 *   D.line,
 *   D.text('dolor sit amet')
 * ])
 *
 * console.log(R.render(doc))
 * // lorem ipsum
 * // dolor sit amet
 *
 * console.log(R.render(D.group(doc)))
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
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.hcat([
 *   D.text('lorem ipsum'),
 *   D.lineBreak,
 *   D.text('dolor sit amet')
 * ])
 *
 * console.log(R.render(doc))
 * // lorem ipsum
 * // dolor sit amet
 *
 * console.log(R.render(D.group(doc)))
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
 * import { pipe } from 'fp-ts/function'
 *
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * // Here we have enough space to put everything onto one line:
 *
 * const doc = D.hcat([
 *   D.text('lorem ipsum'),
 *   D.softLine,
 *   D.text('dolor sit amet')
 * ])
 *
 * console.log(pipe(doc, R.renderWidth(80)))
 * // lorem ipsum dolor sit amet
 *
 * // If the page width is narrowed to `10`, the layout algorithm will
 * // introduce a line break:
 *
 * console.log(pipe(doc, R.renderWidth(10)))
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
 * import { pipe } from 'fp-ts/function'
 *
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * // With enough space, we get direct concatenation of documents:
 * const doc = D.hcat([
 *   D.text('ThisText'),
 *   D.softLineBreak,
 *   D.text('IsWayTooLong')
 * ])
 *
 * console.log(pipe(doc, R.renderWidth(80)))
 * // ThisTextIsWayTooLong
 *
 * // If the page width is narrowed to `10`, the layout algorithm will
 * // introduce a line break:
 * console.log(pipe(doc, R.renderWidth(10)))
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
 * import { pipe } from 'fp-ts/function'
 *
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.hcat([
 *   D.text('lorem ipsum'),
 *   D.hardLine,
 *   D.text('dolor sit amet')
 * ])
 *
 * console.log(pipe(doc, R.renderWidth(1000)))
 * // lorem ipsum
 * // dolor sit amet
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const hardLine: Doc<never> = Line

/**
 * The `nest` combinator will layout a document with the current nesting
 * level (indentation of the following lines) increased by the specified
 * `indent`. Negative values are allowed and will decrease the nesting
 * level accordingly.
 *
 * See also:
 * * [`hang`](#hang): nest a document relative to the current cursor
 * position instead of the current nesting level
 * * [`align`](#align): set the nesting level to the current cursor
 * position
 * * [`indent`](#indent): increase the indentation on the spot, padding
 * any empty space with spaces
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 *
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.vsep([
 *   pipe(D.vsep(D.words('lorem ipsum dolor')), D.nest(4)),
 *   D.text('sit'),
 *   D.text('amet')
 * ])
 *
 * console.log(R.render(doc))
 * // lorem
 * //     ipsum
 * //     dolor
 * // sit
 * // amet
 *
 * @category primitive combinators
 * @since 0.0.1
 */
export const nest = (indent: number) => <A>(doc: Doc<A>): Doc<A> =>
  indent === 0 ? doc : Nest(indent, doc)

// -------------------------------------------------------------------------------------
// alternative combinators
// -------------------------------------------------------------------------------------

/**
 * The `group` combinator attempts to lay out a document onto a single line by
 * removing the contained line breaks. If the result does not fit the page, or
 * if a `hardLine` prevents flattening the document, `x` is laid out without
 * any changes.
 *
 * The `group` function is key to layouts that adapt to available space nicely.
 *
 * @category alternative combinators
 * @since 0.0.1
 */
export const group = <A>(doc: Doc<A>): Doc<A> => {
  const group_ = (a: Doc<A>): Doc<A> =>
    pipe(
      F.changesUponFlattening(a),
      F.match({
        Flattened: (b) => Union(b, a),
        AlreadyFlat: () => a,
        NeverFlat: () => a
      })
    )
  return pipe(
    doc,
    match({
      Fail: () => group_(doc),
      Empty: () => group_(doc),
      Char: () => group_(doc),
      Text: () => group_(doc),
      Line: () => group_(doc),
      FlatAlt: (a, b) =>
        pipe(
          F.changesUponFlattening(b),
          F.match({
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
 * The `flatAlt` document will render `x` by default. However, when
 * `group`ed, `y` will be preferred with `x` as the fallback for cases
 * where `y` does not fit onto the page.
 *
 * **NOTE:**
 * Users should be careful to ensure that `x` is less wide than `y`.
 * Otherwise, if `y` ends up not fitting the page, then the layout
 * algorithms will fall back to an even wider layout.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 *
 * import type { Doc } from 'prettyprinter-ts/lib/Doc'
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const open = D.flatAlt(D.empty, D.text('{ '))
 * const close = D.flatAlt(D.empty, D.text(' }'))
 * const separator = D.flatAlt(D.empty, D.text('; '))
 *
 * const prettyDo = <A>(xs: ReadonlyArray<Doc<A>>): Doc<A> =>
 *   D.group(D.hsep([D.text('do'), D.align(pipe(xs, D.encloseSep<A>(open, close, separator)))]))
 *
 * const statements = [
 *   D.text('name:_ <- getArgs'),
 *   D.text('let greet = "Hello, " <> name"'),
 *   D.text('putStrLn greet')
 * ]
 *
 * // If it fits, then the content is put onto a single line with the `{;}` style
 * console.log(pipe(prettyDo(statements), R.renderWidth(80)))
 * // do { name:_ <- getArgs; let greet = "Hello, " <> name"; putStrLn greet }
 *
 * // When there is not enough space, the content is broken up onto multiple lines
 * console.log(pipe(prettyDo(statements), R.renderWidth(10)))
 * // do name:_ <- getArgs
 * //    let greet = "Hello, " <> name"
 * //    putStrLn greet
 *
 * @category alternative combinators
 * @since 0.0.1
 */
export const flatAlt = <A>(x: Doc<A>, y: Doc<A>): Doc<A> => FlatAlt(x, y)

// -------------------------------------------------------------------------------------
// alignment combinators
// -------------------------------------------------------------------------------------

/**
 * The `align` combinator lays out a document with the nesting level set to
 * the current column.
 *
 * @example
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * // As an example, the documents below will be placed one above the other
 * // regardless of the current nesting level
 *
 * // Without `align`ment, the second line is simply placed below everything
 * // that has been laid out so far
 * const unaligned = D.hsep([
 *   D.text('lorem'),
 *   D.vsep([D.text('ipsum'), D.text('dolor')])
 * ])
 *
 * console.log(R.render(unaligned))
 * // lorem ipsum
 * // dolor
 *
 * // With `align`ment, the `vsep`ed documents all start at the same column
 * const aligned = D.hsep([
 *   D.text('lorem'),
 *   D.align(D.vsep([D.text('ipsum'), D.text('dolor')]))
 * ])
 *
 * console.log(R.render(aligned))
 * // lorem ipsum
 * //       dolor
 *
 * @category alignment combinators
 * @since 0.0.1
 */
export const align = <A>(doc: Doc<A>): Doc<A> => column((k) => nesting((i) => nest(k - i)(doc)))

/**
 * The `hang` combinator lays out a document with the nesting level set to
 * the *current column* plus the specified `indent`. Negative values for `indent`
 * are allowed and decrease the nesting level accordingly.
 *
 * This differs from the `nest` combinator, which is based on the *current
 * nesting level* plus the specified `indent`. When you're not sure, try the more
 * efficient combinator (`nest`) first.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 *
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.hsep([
 *   D.text('prefix'),
 *   pipe(D.reflow('Indenting these words with hang'), D.hang(4))
 * ])
 *
 * console.log(pipe(doc, R.renderWidth(24)))
 * // prefix Indenting these
 * //            words with
 * //            hang
 *
 * @category alignment combinators
 * @since 0.0.1
 */
export const hang = (indent: number): (<A>(doc: Doc<A>) => Doc<A>) => flow(nest(indent), align)

/**
 * The `indent` combinator indents a document by the specified `indent`
 * beginning from the current cursor position.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 *
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.hsep([
 *   D.text('prefix'),
 *   pipe(D.reflow('The indent function indents these words!'), D.indent(4))
 * ])
 *
 * console.log(pipe(doc, R.renderWidth(24)))
 * //  prefix    The indent
 * //            function
 * //            indents these
 * //            words!
 *
 * @category alignment combinators
 * @since 0.0.1
 */
export const indent = (indent: number) => <A>(doc: Doc<A>): Doc<A> =>
  pipe(Cat<A>(spaces(indent), doc), hang(indent))

/**
 * The `encloseSep` combinator concatenates a list of documents, separating
 * each document in the list using the specified `sep` document. After
 * concatenation, the resulting document is enclosed by the specified `left`
 * and `right` documents.
 *
 * To place the `sep` document at the end of each list entry, see the
 * `punctuate` combinator.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import * as RA from 'fp-ts/ReadonlyArray'
 *
 * import type { Doc } from 'prettyprinter-ts/lib/Doc'
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.hsep([
 *   D.text('list'),
 *   D.align(
 *     pipe(
 *       ['1', '20', '300', '4000'],
 *       RA.map<string, Doc<never>>((n) => (n.length === 1 ? D.char(n) : D.text(n))),
 *       D.encloseSep(D.lbracket, D.rbracket, D.comma)
 *     )
 *   )
 * ])
 *
 * // The documents are laid out horizontally if that fits the page:
 * console.log(pipe(doc, R.renderWidth(80)))
 * // list [1,20,300,4000]
 *
 * // Otherwise they are laid out vertically, with separators put in the front:
 * console.log(pipe(doc, R.renderWidth(10)))
 * // list [1
 * //      ,20
 * //      ,300
 * //      ,4000]
 *
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
 * import { pipe } from 'fp-ts/function'
 * import * as RA from 'fp-ts/ReadonlyArray'
 *
 * import type { Doc } from 'prettyprinter-ts/lib/Doc'
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = pipe(
 *   ['1', '20', '300', '4000'],
 *   RA.map<string, Doc<never>>((n) => (n.length === 1 ? D.char(n) : D.text(n))),
 *   D.list
 * )
 *
 * console.log(pipe(doc, R.renderWidth(80)))
 * // [1, 20, 300, 4000]
 *
 * @category alignment combinators
 * @since 0.0.1
 */
export const list = <A>(docs: ReadonlyArray<Doc<A>>): Doc<A> =>
  pipe(
    docs,
    encloseSep(flatAlt<A>(char('[ '), lbracket), flatAlt<A>(char(' ]'), rbracket), char(', ')),
    group
  )

/**
 * A Haskell-inspired variant of `encloseSep` that uses a comma as the separator and
 * parentheses as the enclosure for a list of documents.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import * as RA from 'fp-ts/ReadonlyArray'
 *
 * import type { Doc } from 'prettyprinter-ts/lib/Doc'
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = pipe(
 *   ['1', '20', '300', '4000'],
 *   RA.map<string, Doc<never>>((n) => (n.length === 1 ? D.char(n) : D.text(n))),
 *   D.tupled
 * )
 *
 * console.log(pipe(doc, R.renderWidth(80)))
 * // (1, 20, 300, 4000)
 *
 * @category alignment combinators
 * @since 0.0.1
 */
export const tupled = <A>(docs: ReadonlyArray<Doc<A>>): Doc<A> =>
  pipe(
    docs,
    encloseSep(flatAlt<A>(char('( '), lparen), flatAlt<A>(char(' )'), rparen), char(', ')),
    group
  )

// -------------------------------------------------------------------------------------
// reactive/conditional combinators
// -------------------------------------------------------------------------------------

/**
 * The `column` combinator lays out a document depending upon the column at which
 * the document starts.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import * as RA from 'fp-ts/ReadonlyArray'
 *
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * // Example 1:
 * const example1 = D.column((l) => D.hsep([D.text('Columns are'), D.text(`${l}-based.`)]))
 *
 * console.log(R.render(example1))
 * // Columns are 0-based.
 *
 * // Example 2:
 * const doc = D.hsep([
 *   D.text('prefix'),
 *   D.column((l) => D.text(`| <- column ${l}`))
 * ])
 *
 * const example2 = D.vsep(
 *   pipe(
 *     [0, 4, 8],
 *     RA.map((n) => D.indent(n)(doc))
 *   )
 * )
 *
 * console.log(R.render(example2))
 * // prefix | <- column 7
 * //     prefix | <- column 11
 * //         prefix | <- column 15
 *
 * @category reactive/conditional combinators
 * @since 0.0.1
 */
export const column: <A>(react: (position: number) => Doc<A>) => Doc<A> = Column

/**
 * The `nesting` combinator lays out a document depending upon the current
 * nesting level (i.e., the current indentation of the document).
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import * as RA from 'fp-ts/ReadonlyArray'
 *
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.hsep([D.text('prefix'), D.nesting((l) => D.brackets(D.text(`Nested: ${l}`)))])
 *
 * const example = D.vsep(
 *   pipe(
 *     [0, 4, 8],
 *     RA.map((n) => D.indent(n)(doc))
 *   )
 * )
 *
 * console.log(R.render(example))
 * // prefix [Nested: 0]
 * //     prefix [Nested: 4]
 * //         prefix [Nested: 8]
 *
 * @category reactive/conditional combinators
 * @since 0.0.1
 */
export const nesting: <A>(react: (level: number) => Doc<A>) => Doc<A> = Nesting

/**
 * The `width` combinator makes the column width of a document available to
 * the document while rendering.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import * as RA from 'fp-ts/ReadonlyArray'
 *
 * import type { Doc } from 'prettyprinter-ts/lib/Doc'
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const annotate = <A>(doc: Doc<A>): Doc<A> =>
 *   pipe(
 *     D.brackets(doc),
 *     D.width((w) => D.text(` <- width: ${w}`))
 *   )
 *
 * const docs = [
 *   D.text('---'),
 *   D.text('------'),
 *   pipe(D.text('---'), D.indent(3)),
 *   D.vsep([D.text('---'), pipe(D.text('---'), D.indent(4))])
 * ]
 *
 * const doc = D.align(D.vsep(pipe(docs, RA.map(annotate))))
 *
 * console.log(R.render(doc))
 * // [---] <- width: 5
 * // [------] <- width: 8
 * // [   ---] <- width: 8
 * // [---
 * //     ---] <- width: 8
 *
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
 * The `pageWidth` combinator lays out a document according to the document's
 * `PageWidth`, if specified.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import * as RA from 'fp-ts/ReadonlyArray'
 *
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 * import * as PW from 'prettyprinter-ts/lib/PageWidth'
 *
 * const doc = D.hsep([
 *   D.text('prefix'),
 *   D.pageWidth(
 *     PW.match({
 *       AvailablePerLine: (lw, rf) => D.brackets(D.text(`Width: ${lw}, ribbon fraction: ${rf}`)),
 *       Unbounded: () => D.empty
 *     })
 *   )
 * ])
 *
 * const example = D.vsep(
 *   pipe(
 *     [0, 4, 8],
 *     RA.map((n) => pipe(doc, D.indent(n)))
 *   )
 * )
 *
 * console.log(pipe(example, R.renderWidth(32)))
 * // prefix [Width: 32, ribbon fraction: 1]
 * //     prefix [Width: 32, ribbon fraction: 1]
 * //         prefix [Width: 32, ribbon fraction: 1]
 *
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
 * import { pipe } from 'fp-ts/function'
 *
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = pipe(
 *   [D.char('a'), D.char('b')],
 *   D.concatWith(D.appendWithSpace)
 * )
 *
 * console.log(R.render(doc))
 * // a b
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
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.appendWithSpace(D.char('a'), D.char('b'))
 *
 * console.log(R.render(doc))
 * // a b
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
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.appendWithLine(D.char('a'), D.char('b'))
 *
 * console.log(R.render(doc))
 * // a
 * // b
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
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.appendWithLineBreak(D.char('a'), D.char('b'))
 *
 * console.log(R.render(doc))
 * // a
 * // b
 *
 * console.log(R.render(D.group(doc)))
 * // ab
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
 * import { pipe } from 'fp-ts/function'
 *
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.appendWithSoftLine(D.char('a'), D.char('b'))
 *
 * console.log(R.render(doc))
 * // a b
 *
 * console.log(pipe(doc, R.renderWidth(1)))
 * // a
 * // b
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
 * import { pipe } from 'fp-ts/function'
 *
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.appendWithSoftLineBreak(D.char('a'), D.char('b'))
 *
 * console.log(R.render(doc))
 * // ab
 *
 * console.log(pipe(doc, R.renderWidth(1)))
 * // a
 * // b
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
 * For automatic line breaks, consider using `fillSep`.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 *
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.hsep(D.words('lorem ipsum dolor sit amet'))
 *
 * console.log(pipe(doc, R.renderWidth(80)))
 * // lorem ipsum dolor sit amet
 *
 * // The `hsep` combinator will not introduce line breaks on its own, even when
 * // the page is too narrow
 * console.log(pipe(doc, R.renderWidth(5)))
 * // lorem ipsum dolor sit amet
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
 * When a `vsep` is `group`ed, the documents are separated with a `space` if the layout
 * fits the page, otherwise nothing is done. See the `sep` convenience function for this
 * use case.
 *
 * @example
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const unaligned = D.hsep([
 *   D.text('prefix'),
 *   D.vsep(D.words('text to lay out'))
 * ])
 *
 * console.log(R.render(unaligned))
 * // prefix text
 * // to
 * // lay
 * // out
 *
 * // The `align` function can be used to align the documents under their first element
 * const aligned = D.hsep([
 *   D.text('prefix'),
 *   D.align(D.vsep(D.words('text to lay out')))
 * ])
 *
 * console.log(R.render(aligned))
 * // prefix text
 * //        to
 * //        lay
 * //        out
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
 * @example
 * import { intercalate } from 'fp-ts/Foldable'
 * import { pipe } from 'fp-ts/function'
 * import { monoidString } from 'fp-ts/Monoid'
 * import * as RA from 'fp-ts/ReadonlyArray'
 *
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const intercalateSpace = (xs: ReadonlyArray<string>): string =>
 *   intercalate(monoidString, RA.Foldable)(' ', xs)
 *
 * const words = pipe(RA.replicate(4, 'lorem ipsum dolor sit amet'), intercalateSpace, D.words)
 *
 * const doc = D.hsep([D.text('Docs:'), D.fillSep(words)])
 *
 * console.log(pipe(doc, R.renderWidth(80)))
 * // Docs: lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor
 * // sit amet lorem ipsum dolor sit amet
 *
 * // If the page width is decreased to 40, printing the same document yields:
 * console.log(pipe(doc, R.renderWidth(40)))
 * // Docs: lorem ipsum dolor sit amet lorem
 * // ipsum dolor sit amet lorem ipsum dolor
 * // sit amet lorem ipsum dolor sit amet
 *
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
 * import { pipe } from 'fp-ts/function'
 *
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.hsep([
 *   D.text('prefix'),
 *   D.sep(D.words('text to lay out'))
 * ])
 *
 * console.log(R.render(doc))
 * // prefix text to lay out
 *
 * // If the page width is too narrow, documents are separated by newlines
 * console.log(pipe(doc, R.renderWidth(20)))
 * // prefix text
 * // to
 * // lay
 * // out
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
 * folding an array of documents using the `Semigroup` instance for `Doc`.
 *
 * @example
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.hcat(D.words('lorem ipsum dolor'))
 *
 * console.log(R.render(doc))
 * // loremipsumdolor
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
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.vcat(D.words('lorem ipsum dolor'))
 *
 * console.log(R.render(doc))
 * // lorem
 * // ipsum
 * // dolor
 *
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
 * import { intercalate } from 'fp-ts/Foldable'
 * import { pipe } from 'fp-ts/function'
 * import { monoidString } from 'fp-ts/Monoid'
 * import * as RA from 'fp-ts/ReadonlyArray'
 *
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const intercalateSpace = (xs: ReadonlyArray<string>): string =>
 *   intercalate(monoidString, RA.Foldable)(' ', xs)
 *
 * const words = pipe(RA.replicate(4, 'lorem ipsum dolor sit amet'), intercalateSpace, D.words)
 *
 * // Compare the behavior of `fillCat` and fillSep` when `group`ed
 * const doc = D.hsep([D.text('Grouped:'), D.group(D.fillCat(words))])
 *
 * console.log(R.render(doc))
 * // Grouped: loremipsumdolorsitametloremipsumdolorsitametloremipsumdolorsitametlorem
 * // ipsumdolorsitamet
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
 * import { pipe } from 'fp-ts/function'
 *
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.hsep([
 *   D.text('Docs:'),
 *   D.cat(D.words('lorem ipsum dolor'))
 * ])
 *
 * console.log(R.render(doc))
 * // Docs: loremipsumdolor
 *
 * // If the document exceeds the width of the page, the documents are rendered
 * // one above another
 * console.log(pipe(doc, R.renderWidth(10)))
 * // Docs: lorem
 * // ipsum
 * // dolor
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
 * import { pipe } from 'fp-ts/function'
 * import * as RA from 'fp-ts/ReadonlyArray'
 *
 * import type { Doc } from 'prettyprinter-ts/lib/Doc'
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * type Signature = [name: string, type: string]
 *
 * const signatures: ReadonlyArray<Signature> = [
 *   ['empty', 'Doc'],
 *   ['nest', 'Int -> Doc -> Doc'],
 *   ['fillSep', '[Doc] -> Doc']
 * ]
 *
 * const prettySignature = <A>([name, type]: Signature): Doc<A> =>
 *   D.hsep([pipe(D.text<never>(name), D.fill(5)), D.text('::'), D.text(type)])
 *
 * const doc = D.hsep([D.text('let'), D.align(D.vcat(pipe(signatures, RA.map(prettySignature))))])
 *
 * console.log(R.render(doc))
 * // let empty :: Doc
 * //     nest :: Int -> Doc -> Doc
 * //     fillSep :: [Doc] -> Doc
 *
 * @category filler combinators
 * @since 0.0.1
 */
export const fill: (width: number) => <A>(doc: Doc<A>) => Doc<A> = (lw) => (x) =>
  pipe(
    x,
    width((w) => spaces(lw - w))
  )

/**
 * The `fillBreak` combinator first lays out the document `x` and then appends `space`s
 * until the width of the document is equal to the specified `width`. If the width of
 * `x` is already larger than the specified `width`, the nesting level is increased by
 * the specified `width` and a `line` is appended.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import * as RA from 'fp-ts/ReadonlyArray'
 *
 * import type { Doc } from 'prettyprinter-ts/lib/Doc'
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * type Signature = [name: string, type: string]
 *
 * const signatures: ReadonlyArray<Signature> = [
 *   ['empty', 'Doc'],
 *   ['nest', 'Int -> Doc -> Doc'],
 *   ['fillSep', '[Doc] -> Doc']
 * ]
 *
 * const prettySignature = <A>([name, type]: Signature): Doc<A> =>
 *   D.hsep([pipe(D.text<never>(name), D.fillBreak(5)), D.text('::'), D.text(type)])
 *
 * const doc = D.hsep([D.text('let'), D.align(D.vcat(pipe(signatures, RA.map(prettySignature))))])
 *
 * console.log(R.render(doc))
 * // let empty :: Doc
 * //     nest :: Int -> Doc -> Doc
 * //     fillSep
 * //          :: [Doc] -> Doc
 *
 * @category filler combinators
 * @since 0.0.1
 */
export const fillBreak: (width: number) => <A>(doc: Doc<A>) => Doc<A> = (lw) => (x) =>
  pipe(
    x,
    width((w) => (w > lw ? nest(lw)(lineBreak) : spaces(lw - w)))
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
 * import { pipe } from 'fp-ts/function'
 *
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const docs = pipe(
 *   D.words<never>('lorem ipsum dolor sit amet'),
 *   D.punctuate(D.comma)
 * )
 *
 * console.log(R.render(D.hsep(docs)))
 * // lorem, ipsum, dolor, sit, amet
 *
 * // The separators are put at the end of the entries, which can be better
 * // visualzied if the documents are rendered vertically
 * console.log(R.render(D.vsep(docs)))
 * // lorem,
 * // ipsum,
 * // dolor,
 * // sit,
 * // amet
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
 * import { pipe } from 'fp-ts/function'
 *
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = pipe(D.char('-'), D.enclose(D.char('A'), D.char('Z')))
 *
 * console.log(R.render(doc))
 * // A-Z
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
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 *
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * // The `surround` combinator is just a reordering of the arguments to `enclose`,
 * // but allows for useful definitions such as:
 * const doc = pipe(
 *   D.words<never>('prettyprinter-ts lib Doc'),
 *   D.concatWith(D.surround(D.slash))
 * )
 *
 * console.log(R.render(doc))
 * // prettyprinter-ts/lib/Doc
 *
 * @category general combinators
 * @since 0.0.1
 */
export const surround = <A>(doc: Doc<A>) => (left: Doc<A>, right: Doc<A>): Doc<A> =>
  Cat(left, Cat(doc, right))

/**
 * The `spaces` combinator lays out a document containing `n` spaces. Negative values
 * for `n` count as `0` spaces.
 *
 * @example
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.brackets(D.dquotes(D.spaces(5)))
 *
 * console.log(R.render(doc))
 * // ["     "]
 *
 * @category general combinators
 * @since 0.0.1
 */
export const spaces = <A>(n: number): Doc<A> => {
  if (n <= 0) return Empty
  if (n === 1) return Char(' ')
  return Text(textSpaces(n))
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
  const go: (x: Doc<A>) => Doc<B> = match<A, Doc<B>>({
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
 * Constructs a string containing `n` space characters.
 *
 * @category utils
 * @since 0.0.1
 */
export const textSpaces = (n: number): string => pipe(RA.replicate(n, ' '), M.fold(M.monoidString))

/**
 * Splits a string of words into individual `Text` documents using the
 * specified `char` to split on (defaults to `' '`).
 *
 * @example
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.tupled(D.words('Lorem ipsum dolor'))
 *
 * console.log(R.render(doc))
 * // (lorem, ipsum, dolor)
 *
 * @category utils
 * @since 0.0.1
 */
export const words = <A>(s: string, char = ' '): ReadonlyArray<Doc<A>> =>
  pipe(s.split(char), RA.map<string, Doc<A>>(text))

/**
 * Splits a string of words into individual `Text` documents using the
 * specified `char` to split on (defaults to `' '`). In addition, a
 * `softLine` is inserted in between each word so that if the text
 * exceeds the available width it will be broken into multiple lines.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 *
 * import * as D from 'prettyprinter-ts/lib/Doc'
 * import * as R from 'prettyprinter-ts/lib/Render'
 *
 * const doc = D.reflow(
 *   'Lorem ipsum dolor sit amet, consectetur adipisicing elit, ' +
 *     'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
 * )
 *
 * console.log(pipe(doc, R.renderWidth(32)))
 * // Lorem ipsum dolor sit amet,
 * // consectetur adipisicing elit,
 * // sed do eiusmod tempor incididunt
 * // ut labore et dolore magna
 * // aliqua.
 *
 * @category utils
 * @since 0.0.1
 */
export const reflow = <A>(s: string, char = ' '): Doc<A> => pipe(words<A>(s, char), fillSep)
