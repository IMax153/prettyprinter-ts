---
title: Doc.ts
nav_order: 1
parent: Modules
---

## Doc overview

The abstract data type `Doc` represents prettified documents that
have been annotated with data of type `A`.

More specifically, a value of type `Doc` represents a non-empty
set of possible layouts for a given document. The layout algorithms
select one of these possibilities, taking into account variables
such as the width of the document.

The annotation is an arbitrary piece of data associated with (part
of) a document. Annotations may be used by rendering algorithms to
display documents differently by providing information such as:

- color information (e.g., when rendering to the terminal)
- mouseover text (e.g., when rendering to rich HTML)
- whether to show something or not (to allow simple or detailed versions)

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [Functor](#functor)
  - [map](#map)
- [alignment combinators](#alignment-combinators)
  - [align](#align)
  - [encloseSep](#enclosesep)
  - [hang](#hang)
  - [indent](#indent)
  - [list](#list)
  - [tupled](#tupled)
- [alternative combinators](#alternative-combinators)
  - [flatAlt](#flatalt)
  - [group](#group)
- [cat combinators](#cat-combinators)
  - [cat](#cat)
  - [fillCat](#fillcat)
  - [hcat](#hcat)
  - [vcat](#vcat)
- [concatenation combinators](#concatenation-combinators)
  - [appendWithLine](#appendwithline)
  - [appendWithLineBreak](#appendwithlinebreak)
  - [appendWithSoftLine](#appendwithsoftline)
  - [appendWithSoftLineBreak](#appendwithsoftlinebreak)
  - [appendWithSpace](#appendwithspace)
  - [concatWith](#concatwith)
- [constructors](#constructors)
  - [Annotated](#annotated)
  - [Cat](#cat)
  - [Char](#char)
  - [Column](#column)
  - [Empty](#empty)
  - [Fail](#fail)
  - [FlatAlt](#flatalt)
  - [Line](#line)
  - [Nest](#nest)
  - [Nesting](#nesting)
  - [Text](#text)
  - [Union](#union)
  - [WithPageWidth](#withpagewidth)
- [destructors](#destructors)
  - [match](#match)
- [filler combinators](#filler-combinators)
  - [fill](#fill)
  - [fillBreak](#fillbreak)
- [general combinators](#general-combinators)
  - [enclose](#enclose)
  - [punctuate](#punctuate)
  - [spaces](#spaces)
  - [surround](#surround)
- [instances](#instances)
  - [Functor](#functor-1)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
  - [getMonoid](#getmonoid)
  - [getSemigroup](#getsemigroup)
- [model](#model)
  - [Annotated (interface)](#annotated-interface)
  - [Cat (interface)](#cat-interface)
  - [Char (interface)](#char-interface)
  - [Column (interface)](#column-interface)
  - [Doc (type alias)](#doc-type-alias)
  - [Empty (interface)](#empty-interface)
  - [Fail (interface)](#fail-interface)
  - [FlatAlt (interface)](#flatalt-interface)
  - [Line (interface)](#line-interface)
  - [Nest (interface)](#nest-interface)
  - [Nesting (interface)](#nesting-interface)
  - [Text (interface)](#text-interface)
  - [Union (interface)](#union-interface)
  - [WithPageWidth (interface)](#withpagewidth-interface)
- [primitive combinators](#primitive-combinators)
  - [angles](#angles)
  - [backslash](#backslash)
  - [braces](#braces)
  - [brackets](#brackets)
  - [char](#char)
  - [colon](#colon)
  - [comma](#comma)
  - [dot](#dot)
  - [dquote](#dquote)
  - [dquotes](#dquotes)
  - [empty](#empty)
  - [equals](#equals)
  - [fail](#fail)
  - [hardLine](#hardline)
  - [langle](#langle)
  - [lbrace](#lbrace)
  - [lbracket](#lbracket)
  - [line](#line)
  - [lineBreak](#linebreak)
  - [lparen](#lparen)
  - [nest](#nest)
  - [parens](#parens)
  - [rangle](#rangle)
  - [rbrace](#rbrace)
  - [rbracket](#rbracket)
  - [rparen](#rparen)
  - [semi](#semi)
  - [slash](#slash)
  - [softLine](#softline)
  - [softLineBreak](#softlinebreak)
  - [space](#space)
  - [squote](#squote)
  - [squotes](#squotes)
  - [text](#text)
  - [vbar](#vbar)
- [reactive/conditional combinators](#reactiveconditional-combinators)
  - [column](#column)
  - [nesting](#nesting)
  - [pageWidth](#pagewidth)
  - [width](#width)
- [sep combinators](#sep-combinators)
  - [fillSep](#fillsep)
  - [hsep](#hsep)
  - [sep](#sep)
  - [vsep](#vsep)
- [utils](#utils)
  - [alterAnnotations](#alterannotations)
  - [annotate](#annotate)
  - [reAnnotate](#reannotate)
  - [reflow](#reflow)
  - [textSpaces](#textspaces)
  - [unAnnotate](#unannotate)
  - [words](#words)

---

# Functor

## map

**Signature**

```ts
export declare const map: <A, B>(f: (a: A) => B) => (fa: Doc<A>) => Doc<B>
```

Added in v0.0.1

# alignment combinators

## align

The `align` combinator lays out a document with the nesting level set to
the current column.

**Signature**

```ts
export declare const align: <A>(doc: Doc<A>) => Doc<A>
```

**Example**

```ts
import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

// As an example, the documents below will be placed one above the other
// regardless of the current nesting level

// Without `align`ment, the second line is simply placed below everything
// that has been laid out so far
const unaligned = D.hsep([D.text('lorem'), D.vsep([D.text('ipsum'), D.text('dolor')])])

console.log(R.render(unaligned))
// lorem ipsum
// dolor

// With `align`ment, the `vsep`ed documents all start at the same column
const aligned = D.hsep([D.text('lorem'), D.align(D.vsep([D.text('ipsum'), D.text('dolor')]))])

console.log(R.render(aligned))
// lorem ipsum
//       dolor
```

Added in v0.0.1

## encloseSep

The `encloseSep` combinator concatenates a list of documents, separating
each document in the list using the specified `sep` document. After
concatenation, the resulting document is enclosed by the specified `left`
and `right` documents.

To place the `sep` document at the end of each list entry, see the
`punctuate` combinator.

**Signature**

```ts
export declare const encloseSep: <A>(left: Doc<A>, right: Doc<A>, sep: Doc<A>) => (docs: readonly Doc<A>[]) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import * as RA from 'fp-ts/ReadonlyArray'

import type { Doc } from 'prettyprinter-ts/lib/Doc'
import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.hsep([
  D.text('list'),
  D.align(
    pipe(
      ['1', '20', '300', '4000'],
      RA.map<string, Doc<never>>((n) => (n.length === 1 ? D.char(n) : D.text(n))),
      D.encloseSep(D.lbracket, D.rbracket, D.comma)
    )
  ),
])

// The documents are laid out horizontally if that fits the page:
console.log(pipe(doc, R.renderWidth(80)))
// list [1,20,300,4000]

// Otherwise they are laid out vertically, with separators put in the front:
console.log(pipe(doc, R.renderWidth(10)))
// list [1
//      ,20
//      ,300
//      ,4000]
```

Added in v0.0.1

## hang

The `hang` combinator lays out a document with the nesting level set to
the _current column_ plus the specified `indent`. Negative values for `indent`
are allowed and decrease the nesting level accordingly.

This differs from the `nest` combinator, which is based on the _current
nesting level_ plus the specified `indent`. When you're not sure, try the more
efficient combinator (`nest`) first.

**Signature**

```ts
export declare const hang: (indent: number) => <A>(doc: Doc<A>) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.hsep([D.text('prefix'), pipe(D.reflow('Indenting these words with hang'), D.hang(4))])

console.log(pipe(doc, R.renderWidth(24)))
// prefix Indenting these
//            words with
//            hang
```

Added in v0.0.1

## indent

The `indent` combinator indents a document by the specified `indent`
beginning from the current cursor position.

**Signature**

```ts
export declare const indent: (indent: number) => <A>(doc: Doc<A>) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.hsep([D.text('prefix'), pipe(D.reflow('The indent function indents these words!'), D.indent(4))])

console.log(pipe(doc, R.renderWidth(24)))
//  prefix    The indent
//            function
//            indents these
//            words!
```

Added in v0.0.1

## list

A Haskell-inspired variant of `encloseSep` that uses a comma as the separator and
braces as the enclosure for a list of documents.

**Signature**

```ts
export declare const list: <A>(docs: readonly Doc<A>[]) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import * as RA from 'fp-ts/ReadonlyArray'

import type { Doc } from 'prettyprinter-ts/lib/Doc'
import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = pipe(
  ['1', '20', '300', '4000'],
  RA.map<string, Doc<never>>((n) => (n.length === 1 ? D.char(n) : D.text(n))),
  D.list
)

console.log(pipe(doc, R.renderWidth(80)))
// [1, 20, 300, 4000]
```

Added in v0.0.1

## tupled

A Haskell-inspired variant of `encloseSep` that uses a comma as the separator and
parentheses as the enclosure for a list of documents.

**Signature**

```ts
export declare const tupled: <A>(docs: readonly Doc<A>[]) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import * as RA from 'fp-ts/ReadonlyArray'

import type { Doc } from 'prettyprinter-ts/lib/Doc'
import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = pipe(
  ['1', '20', '300', '4000'],
  RA.map<string, Doc<never>>((n) => (n.length === 1 ? D.char(n) : D.text(n))),
  D.tupled
)

console.log(pipe(doc, R.renderWidth(80)))
// (1, 20, 300, 4000)
```

Added in v0.0.1

# alternative combinators

## flatAlt

The `flatAlt` document will render `x` by default. However, when
`group`ed, `y` will be preferred with `x` as the fallback for cases
where `y` does not fit onto the page.

**NOTE:**
Users should be careful to ensure that `x` is less wide than `y`.
Otherwise, if `y` ends up not fitting the page, then the layout
algorithms will fall back to an even wider layout.

**Signature**

```ts
export declare const flatAlt: <A>(x: Doc<A>, y: Doc<A>) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'

import type { Doc } from 'prettyprinter-ts/lib/Doc'
import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const open = D.flatAlt(D.empty, D.text('{ '))
const close = D.flatAlt(D.empty, D.text(' }'))
const separator = D.flatAlt(D.empty, D.text('; '))

const prettyDo = <A>(xs: ReadonlyArray<Doc<A>>): Doc<A> =>
  D.group(D.hsep([D.text('do'), D.align(pipe(xs, D.encloseSep<A>(open, close, separator)))]))

const statements = [D.text('name:_ <- getArgs'), D.text('let greet = "Hello, " <> name"'), D.text('putStrLn greet')]

// If it fits, then the content is put onto a single line with the `{;}` style
console.log(pipe(prettyDo(statements), R.renderWidth(80)))
// do { name:_ <- getArgs; let greet = "Hello, " <> name"; putStrLn greet }

// When there is not enough space, the content is broken up onto multiple lines
console.log(pipe(prettyDo(statements), R.renderWidth(10)))
// do name:_ <- getArgs
//    let greet = "Hello, " <> name"
//    putStrLn greet
```

Added in v0.0.1

## group

The `group` combinator attempts to lay out a document onto a single line by
removing the contained line breaks. If the result does not fit the page, or
if a `hardLine` prevents flattening the document, `x` is laid out without
any changes.

The `group` function is key to layouts that adapt to available space nicely.

**Signature**

```ts
export declare const group: <A>(doc: Doc<A>) => Doc<A>
```

Added in v0.0.1

# cat combinators

## cat

The `cat` combinator will attempt to lay out a list of documents separated by nothing.
If the output does not fit the page, then the documents will be separated by newlines.
This is what differentiates it from `vcat`, which always lays out documents beneath one
another.

**Signature**

```ts
export declare const cat: <A>(docs: readonly Doc<A>[]) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.hsep([D.text('Docs:'), D.cat(D.words('lorem ipsum dolor'))])

console.log(R.render(doc))
// Docs: loremipsumdolor

// If the document exceeds the width of the page, the documents are rendered
// one above another
console.log(pipe(doc, R.renderWidth(10)))
// Docs: lorem
// ipsum
// dolor
```

Added in v0.0.1

## fillCat

The `fillCat` combinator concatenates all documents in a list horizontally by placing
a `space` between each pair of documents as long as they fit the page. Once the page
width is exceeded, a `lineBreak` is inserted and the process is repeated for all
documents in the list.

**Note** that the use of `lineBreak` means that if `group`ed, the documents will be
separated with `empty` instead of newlines. See `fillSep` if you want a `space` instead.

**Signature**

```ts
export declare const fillCat: <A>(docs: readonly Doc<A>[]) => Doc<A>
```

**Example**

```ts
import { intercalate } from 'fp-ts/Foldable'
import { pipe } from 'fp-ts/function'
import { monoidString } from 'fp-ts/Monoid'
import * as RA from 'fp-ts/ReadonlyArray'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const intercalateSpace = (xs: ReadonlyArray<string>): string => intercalate(monoidString, RA.Foldable)(' ', xs)

const words = pipe(RA.replicate(4, 'lorem ipsum dolor sit amet'), intercalateSpace, D.words)

// Compare the behavior of `fillCat` and fillSep` when `group`ed
const doc = D.hsep([D.text('Grouped:'), D.group(D.fillCat(words))])

console.log(R.render(doc))
// Grouped: loremipsumdolorsitametloremipsumdolorsitametloremipsumdolorsitametlorem
// ipsumdolorsitamet
```

Added in v0.0.1

## hcat

The `hcat` combinator concatenates all documents in a list horizontally without
any spacing. It is provided for completeness, but is identical in function to
folding an array of documents using the `Semigroup` instance for `Doc`.

**Signature**

```ts
export declare const hcat: <A>(docs: readonly Doc<A>[]) => Doc<A>
```

**Example**

```ts
import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.hcat(D.words('lorem ipsum dolor'))

console.log(R.render(doc))
// loremipsumdolor
```

Added in v0.0.1

## vcat

The `vcat` combinator concatenates all documents in a list vertically. If the
output is grouped then the line breaks are removed.

**Signature**

```ts
export declare const vcat: <A>(docs: readonly Doc<A>[]) => Doc<A>
```

**Example**

```ts
import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.vcat(D.words('lorem ipsum dolor'))

console.log(R.render(doc))
// lorem
// ipsum
// dolor
```

Added in v0.0.1

# concatenation combinators

## appendWithLine

The `appendWithLine` combinator concatenates two documents, `x` and `y`, with a
`line` between them.

**Signature**

```ts
export declare const appendWithLine: <A>(x: Doc<A>, y: Doc<A>) => Doc<A>
```

**Example**

```ts
import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.appendWithLine(D.char('a'), D.char('b'))

console.log(R.render(doc))
// a
// b
```

Added in v0.0.1

## appendWithLineBreak

The `appendWithLineBreak` combinator concatenates two documents, `x` and `y`, with a
`lineBreak` between them.

**Signature**

```ts
export declare const appendWithLineBreak: <A>(x: Doc<A>, y: Doc<A>) => Doc<A>
```

**Example**

```ts
import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.appendWithLineBreak(D.char('a'), D.char('b'))

console.log(R.render(doc))
// a
// b

console.log(R.render(D.group(doc)))
// ab
```

Added in v0.0.1

## appendWithSoftLine

The `appendWithSoftLine` combinator concatenates two documents, `x` and `y`, with a
`softLine` between them.

**Signature**

```ts
export declare const appendWithSoftLine: <A>(x: Doc<A>, y: Doc<A>) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.appendWithSoftLine(D.char('a'), D.char('b'))

console.log(R.render(doc))
// a b

console.log(pipe(doc, R.renderWidth(1)))
// a
// b
```

Added in v0.0.1

## appendWithSoftLineBreak

The `appendWithSoftLineBreak` combinator concatenates two documents, `x` and `y`, with a
`softLineBreak` between them.

**Signature**

```ts
export declare const appendWithSoftLineBreak: <A>(x: Doc<A>, y: Doc<A>) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.appendWithSoftLineBreak(D.char('a'), D.char('b'))

console.log(R.render(doc))
// ab

console.log(pipe(doc, R.renderWidth(1)))
// a
// b
```

Added in v0.0.1

## appendWithSpace

The `appendWithSpace` combinator concatenates two documents, `x` and `y`, with a
`space` between them.

**Signature**

```ts
export declare const appendWithSpace: <A>(x: Doc<A>, y: Doc<A>) => Doc<A>
```

**Example**

```ts
import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.appendWithSpace(D.char('a'), D.char('b'))

console.log(R.render(doc))
// a b
```

Added in v0.0.1

## concatWith

The `concatWith` combinator concatenates all documents in a list element-wise with
a binary function.

**Signature**

```ts
export declare const concatWith: <A>(f: (x: Doc<A>, y: Doc<A>) => Doc<A>) => (docs: readonly Doc<A>[]) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = pipe([D.char('a'), D.char('b')], D.concatWith(D.appendWithSpace))

console.log(R.render(doc))
// a b
```

Added in v0.0.1

# constructors

## Annotated

**Signature**

```ts
export declare const Annotated: <A>(annotation: A, doc: Doc<A>) => Doc<A>
```

Added in v0.0.1

## Cat

**Signature**

```ts
export declare const Cat: <A>(x: Doc<A>, y: Doc<A>) => Doc<A>
```

Added in v0.0.1

## Char

**Signature**

```ts
export declare const Char: <A>(char: string) => Doc<A>
```

Added in v0.0.1

## Column

**Signature**

```ts
export declare const Column: <A>(react: (position: number) => Doc<A>) => Doc<A>
```

Added in v0.0.1

## Empty

**Signature**

```ts
export declare const Empty: Doc<never>
```

Added in v0.0.1

## Fail

**Signature**

```ts
export declare const Fail: Doc<never>
```

Added in v0.0.1

## FlatAlt

**Signature**

```ts
export declare const FlatAlt: <A>(x: Doc<A>, y: Doc<A>) => Doc<A>
```

Added in v0.0.1

## Line

**Signature**

```ts
export declare const Line: Doc<never>
```

Added in v0.0.1

## Nest

**Signature**

```ts
export declare const Nest: <A>(indent: number, doc: Doc<A>) => Doc<A>
```

Added in v0.0.1

## Nesting

**Signature**

```ts
export declare const Nesting: <A>(react: (level: number) => Doc<A>) => Doc<A>
```

Added in v0.0.1

## Text

**Signature**

```ts
export declare const Text: <A>(text: string) => Doc<A>
```

Added in v0.0.1

## Union

**Signature**

```ts
export declare const Union: <A>(x: Doc<A>, y: Doc<A>) => Doc<A>
```

Added in v0.0.1

## WithPageWidth

**Signature**

```ts
export declare const WithPageWidth: <A>(react: (pageWidth: PageWidth) => Doc<A>) => Doc<A>
```

Added in v0.0.1

# destructors

## match

**Signature**

```ts
export declare const match: <A, R>(patterns: {
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
}) => (doc: Doc<A>) => R
```

Added in v0.0.1

# filler combinators

## fill

The `fill` combinator first lays out the document `x` and then appends `space`s
until the width of the document is equal to the specified `width`. If the width
of `x` is already larger than the specified `width`, nothing is appended.

**Signature**

```ts
export declare const fill: (width: number) => <A>(doc: Doc<A>) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import * as RA from 'fp-ts/ReadonlyArray'

import type { Doc } from 'prettyprinter-ts/lib/Doc'
import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

type Signature = [name: string, type: string]

const signatures: ReadonlyArray<Signature> = [
  ['empty', 'Doc'],
  ['nest', 'Int -> Doc -> Doc'],
  ['fillSep', '[Doc] -> Doc'],
]

const prettySignature = <A>([name, type]: Signature): Doc<A> =>
  D.hsep([pipe(D.text<never>(name), D.fill(5)), D.text('::'), D.text(type)])

const doc = D.hsep([D.text('let'), D.align(D.vcat(pipe(signatures, RA.map(prettySignature))))])

console.log(R.render(doc))
// let empty :: Doc
//     nest :: Int -> Doc -> Doc
//     fillSep :: [Doc] -> Doc
```

Added in v0.0.1

## fillBreak

The `fillBreak` combinator first lays out the document `x` and then appends `space`s
until the width of the document is equal to the specified `width`. If the width of
`x` is already larger than the specified `width`, the nesting level is increased by
the specified `width` and a `line` is appended.

**Signature**

```ts
export declare const fillBreak: (width: number) => <A>(doc: Doc<A>) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import * as RA from 'fp-ts/ReadonlyArray'

import type { Doc } from 'prettyprinter-ts/lib/Doc'
import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

type Signature = [name: string, type: string]

const signatures: ReadonlyArray<Signature> = [
  ['empty', 'Doc'],
  ['nest', 'Int -> Doc -> Doc'],
  ['fillSep', '[Doc] -> Doc'],
]

const prettySignature = <A>([name, type]: Signature): Doc<A> =>
  D.hsep([pipe(D.text<never>(name), D.fillBreak(5)), D.text('::'), D.text(type)])

const doc = D.hsep([D.text('let'), D.align(D.vcat(pipe(signatures, RA.map(prettySignature))))])

console.log(R.render(doc))
// let empty :: Doc
//     nest :: Int -> Doc -> Doc
//     fillSep
//          :: [Doc] -> Doc
```

Added in v0.0.1

# general combinators

## enclose

The `enclose` combinator encloses a document `x` in between `left` and `right`
documents using `Cat`.

**Signature**

```ts
export declare const enclose: <A>(left: Doc<A>, right: Doc<A>) => (doc: Doc<A>) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = pipe(D.char('-'), D.enclose(D.char('A'), D.char('Z')))

console.log(R.render(doc))
// A-Z
```

Added in v0.0.1

## punctuate

The `punctuate` combinator appends the `punctuator` document to all by the last
document in a list of documents. The separators are places after the document
entries, which can be observed if the result is oriented vertically.

**Signature**

```ts
export declare const punctuate: <A>(punctuator: Doc<A>) => (docs: readonly Doc<A>[]) => readonly Doc<A>[]
```

**Example**

```ts
import { pipe } from 'fp-ts/function'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const docs = pipe(D.words<never>('lorem ipsum dolor sit amet'), D.punctuate(D.comma))

console.log(R.render(D.hsep(docs)))
// lorem, ipsum, dolor, sit, amet

// The separators are put at the end of the entries, which can be better
// visualzied if the documents are rendered vertically
console.log(R.render(D.vsep(docs)))
// lorem,
// ipsum,
// dolor,
// sit,
// amet
```

Added in v0.0.1

## spaces

The `spaces` combinator lays out a document containing `n` spaces. Negative values
for `n` count as `0` spaces.

**Signature**

```ts
export declare const spaces: <A>(n: number) => Doc<A>
```

**Example**

```ts
import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.brackets(D.dquotes(D.spaces(5)))

console.log(R.render(doc))
// ["     "]
```

Added in v0.0.1

## surround

The `surround` combinator surrounds a document `x` in between `left` and `right`
documents using `Cat`.

**Signature**

```ts
export declare const surround: <A>(doc: Doc<A>) => (left: Doc<A>, right: Doc<A>) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

// The `surround` combinator is just a reordering of the arguments to `enclose`,
// but allows for useful definitions such as:
const doc = pipe(D.words<never>('prettyprinter-ts lib Doc'), D.concatWith(D.surround(D.slash)))

console.log(R.render(doc))
// prettyprinter-ts/lib/Doc
```

Added in v0.0.1

# instances

## Functor

**Signature**

```ts
export declare const Functor: Functor1<'prettyprinter-ts/Doc'>
```

Added in v0.0.1

## URI

**Signature**

```ts
export declare const URI: 'prettyprinter-ts/Doc'
```

Added in v0.0.1

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v0.0.1

## getMonoid

**Signature**

```ts
export declare const getMonoid: <A>() => Monoid<Doc<A>>
```

Added in v0.0.1

## getSemigroup

**Signature**

```ts
export declare const getSemigroup: <A>() => Semigroup<Doc<A>>
```

Added in v0.0.1

# model

## Annotated (interface)

Represents a document with an associated annotation.

**Signature**

```ts
export interface Annotated<A> {
  readonly _tag: 'Annotated'
  readonly annotation: A
  readonly doc: Doc<A>
}
```

Added in v0.0.1

## Cat (interface)

Represents the concatenation of two documents.

**Signature**

```ts
export interface Cat<A> {
  readonly _tag: 'Cat'
  readonly x: Doc<A>
  readonly y: Doc<A>
}
```

Added in v0.0.1

## Char (interface)

Represents a document containing a single character.

**Invariants**

- Cannot be the newline (`"\n"`) character

**Signature**

```ts
export interface Char {
  readonly _tag: 'Char'
  readonly char: string
}
```

Added in v0.0.1

## Column (interface)

Represents a document that reacts to the current cursor
position.

**Signature**

```ts
export interface Column<A> {
  readonly _tag: 'Column'
  readonly react: (position: number) => Doc<A>
}
```

Added in v0.0.1

## Doc (type alias)

**Signature**

```ts
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
```

Added in v0.0.1

## Empty (interface)

Represents the empty document. Conceptually, the unit of `Cat`.

**Signature**

```ts
export interface Empty {
  readonly _tag: 'Empty'
}
```

Added in v0.0.1

## Fail (interface)

Represents a document that cannot be rendered. Generally occurs when
flattening a line. The layout algorithms will reject this document
and choose a more suitable rendering.

**Signature**

```ts
export interface Fail {
  readonly _tag: 'Fail'
}
```

Added in v0.0.1

## FlatAlt (interface)

Represents a flattened alternative of two documents. The
layout algorithms will choose the first document, but when
flattened (via `group`) the second document will be preferred.

The layout algorithms operate under the assumption that the
first alternative is less wide than the flattened second
alternative.

**Signature**

```ts
export interface FlatAlt<A> {
  readonly _tag: 'FlatAlt'
  readonly x: Doc<A>
  readonly y: Doc<A>
}
```

Added in v0.0.1

## Line (interface)

Represents a document that contains a hard line break.

**Signature**

```ts
export interface Line {
  readonly _tag: 'Line'
}
```

Added in v0.0.1

## Nest (interface)

Represents a document that is indented by a certain
number of columns.

**Signature**

```ts
export interface Nest<A> {
  readonly _tag: 'Nest'
  readonly indent: number
  readonly doc: Doc<A>
}
```

Added in v0.0.1

## Nesting (interface)

Represents a document that reacts to the current nesting level.

**Signature**

```ts
export interface Nesting<A> {
  readonly _tag: 'Nesting'
  readonly react: (level: number) => Doc<A>
}
```

Added in v0.0.1

## Text (interface)

Represents a document containing a string of text.

**Invariants**

- Text cannot be less than two characters long
- Text cannot contain a newline (`"\n"`) character

**Signature**

```ts
export interface Text {
  readonly _tag: 'Text'
  readonly text: string
}
```

Added in v0.0.1

## Union (interface)

Represents the union of two documents. Used to implement
layout alternatives for `group`.

**Invariants**

- The first lines of the first document should be longer
  than the first lines of the second document so that the
  layout algorithm can pick the document with the best fit

**Signature**

```ts
export interface Union<A> {
  readonly _tag: 'Union'
  readonly x: Doc<A>
  readonly y: Doc<A>
}
```

Added in v0.0.1

## WithPageWidth (interface)

Represents a document that reacts to the current page width.

**Signature**

```ts
export interface WithPageWidth<A> {
  readonly _tag: 'WithPageWidth'
  readonly react: (pageWidth: PageWidth) => Doc<A>
}
```

Added in v0.0.1

# primitive combinators

## angles

Encloses the input document in angle brackets (`<>`).

**Signature**

```ts
export declare const angles: <A>(doc: Doc<A>) => Doc<A>
```

Added in v0.0.1

## backslash

A document containing a single `\` character.

**Signature**

```ts
export declare const backslash: Doc<never>
```

Added in v0.0.1

## braces

Encloses the input document in braces (`{}`).

**Signature**

```ts
export declare const braces: <A>(doc: Doc<A>) => Doc<A>
```

Added in v0.0.1

## brackets

Encloses the input document in brackets (`[]`).

**Signature**

```ts
export declare const brackets: <A>(doc: Doc<A>) => Doc<A>
```

Added in v0.0.1

## char

A document containing a single character.

**Invariants**

- Cannot be the newline (`"\n"`) character

**Signature**

```ts
export declare const char: <A>(char: string) => Doc<A>
```

Added in v0.0.1

## colon

A document containing a single `:` character.

**Signature**

```ts
export declare const colon: Doc<never>
```

Added in v0.0.1

## comma

A document containing a single `,` character.

**Signature**

```ts
export declare const comma: Doc<never>
```

Added in v0.0.1

## dot

A document containing a single `.` character.

**Signature**

```ts
export declare const dot: Doc<never>
```

Added in v0.0.1

## dquote

A document containing a single `"` character.

**Signature**

```ts
export declare const dquote: Doc<never>
```

Added in v0.0.1

## dquotes

Encloses the input document in double quotes (`""`).

**Signature**

```ts
export declare const dquotes: <A>(doc: Doc<A>) => Doc<A>
```

Added in v0.0.1

## empty

The empty document behaves like a document containing the empty string
(`""`), so it has a height of `1`.

This may lead to surprising behavior if the empty document is expected
to bear no weight inside certain layout functions, such as`vcat`, where
it will render an empty line of output.

**Signature**

```ts
export declare const empty: Doc<never>
```

**Example**

```ts
import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.vsep([
  D.text('hello'),
  D.parens(D.empty), // `parens` for visibility purposes only
  D.text('world'),
])

console.log(R.render(doc))
// hello
// ()
// world
```

Added in v0.0.1

## equals

A document containing a single `=` character.

**Signature**

```ts
export declare const equals: Doc<never>
```

Added in v0.0.1

## fail

A document that cannot be rendered.

Generally occurs when flattening a line. The layout algorithms will
reject this document and choose a more suitable rendering.

**Signature**

```ts
export declare const fail: Doc<never>
```

Added in v0.0.1

## hardLine

The `hardLine` document is always laid out as a line break,
regardless of space or whether or not the document was
`group`'ed.

**Signature**

```ts
export declare const hardLine: Doc<never>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.hcat([D.text('lorem ipsum'), D.hardLine, D.text('dolor sit amet')])

console.log(pipe(doc, R.renderWidth(1000)))
// lorem ipsum
// dolor sit amet
```

Added in v0.0.1

## langle

A document containing a single `<` character.

**Signature**

```ts
export declare const langle: Doc<never>
```

Added in v0.0.1

## lbrace

A document containing a single `{` character.

**Signature**

```ts
export declare const lbrace: Doc<never>
```

Added in v0.0.1

## lbracket

A document containing a single `[` character.

**Signature**

```ts
export declare const lbracket: Doc<never>
```

Added in v0.0.1

## line

The `line` document advances to the next line and indents to the
current nesting level. However, `line` will behave like `space`
if the line break is undone by `group`.

**Signature**

```ts
export declare const line: Doc<never>
```

**Example**

```ts
import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.hcat([D.text('lorem ipsum'), D.line, D.text('dolor sit amet')])

console.log(R.render(doc))
// lorem ipsum
// dolor sit amet

console.log(R.render(D.group(doc)))
// lorem ipsum dolor sit amet
```

Added in v0.0.1

## lineBreak

The `lineBreak` document is like `line` but behaves like `empty` if the
line break is undone by `group` (instead of `space`).

**Signature**

```ts
export declare const lineBreak: Doc<never>
```

**Example**

```ts
import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.hcat([D.text('lorem ipsum'), D.lineBreak, D.text('dolor sit amet')])

console.log(R.render(doc))
// lorem ipsum
// dolor sit amet

console.log(R.render(D.group(doc)))
// lorem ipsumdolor sit amet
```

Added in v0.0.1

## lparen

A document containing a single `(` character.

**Signature**

```ts
export declare const lparen: Doc<never>
```

Added in v0.0.1

## nest

The `nest` combinator will layout a document with the current nesting
level (indentation of the following lines) increased by the specified
`indent`. Negative values are allowed and will decrease the nesting
level accordingly.

See also:

- [`hang`](#hang): nest a document relative to the current cursor
  position instead of the current nesting level
- [`align`](#align): set the nesting level to the current cursor
  position
- [`indent`](#indent): increase the indentation on the spot, padding
  any empty space with spaces

**Signature**

```ts
export declare const nest: (indent: number) => <A>(doc: Doc<A>) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.vsep([pipe(D.vsep(D.words('lorem ipsum dolor')), D.nest(4)), D.text('sit'), D.text('amet')])

console.log(R.render(doc))
// lorem
//     ipsum
//     dolor
// sit
// amet
```

Added in v0.0.1

## parens

Encloses the input document in parentheses (`()`).

**Signature**

```ts
export declare const parens: <A>(doc: Doc<A>) => Doc<A>
```

Added in v0.0.1

## rangle

A document containing a single `>` character.

**Signature**

```ts
export declare const rangle: Doc<never>
```

Added in v0.0.1

## rbrace

A document containing a single `}` character.

**Signature**

```ts
export declare const rbrace: Doc<never>
```

Added in v0.0.1

## rbracket

A document containing a single `]` character.

**Signature**

```ts
export declare const rbracket: Doc<never>
```

Added in v0.0.1

## rparen

A document containing a single `)` character.

**Signature**

```ts
export declare const rparen: Doc<never>
```

Added in v0.0.1

## semi

A document containing a single `;` character.

**Signature**

```ts
export declare const semi: Doc<never>
```

Added in v0.0.1

## slash

A document containing a single `/` character.

**Signature**

```ts
export declare const slash: Doc<never>
```

Added in v0.0.1

## softLine

The `softLine` document behaves like `space` if the resulting output
fits onto the page, otherwise it behaves like `line`.

**Signature**

```ts
export declare const softLine: Doc<never>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

// Here we have enough space to put everything onto one line:

const doc = D.hcat([D.text('lorem ipsum'), D.softLine, D.text('dolor sit amet')])

console.log(pipe(doc, R.renderWidth(80)))
// lorem ipsum dolor sit amet

// If the page width is narrowed to `10`, the layout algorithm will
// introduce a line break:

console.log(pipe(doc, R.renderWidth(10)))
// lorem ipsum
// dolor sit amet
```

Added in v0.0.1

## softLineBreak

The `softLineBreak` document is similar to `softLine`, but behaves
like `empty` if the resulting output does not fit onto the page
(instead of `space`).

**Signature**

```ts
export declare const softLineBreak: Doc<never>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

// With enough space, we get direct concatenation of documents:
const doc = D.hcat([D.text('ThisText'), D.softLineBreak, D.text('IsWayTooLong')])

console.log(pipe(doc, R.renderWidth(80)))
// ThisTextIsWayTooLong

// If the page width is narrowed to `10`, the layout algorithm will
// introduce a line break:
console.log(pipe(doc, R.renderWidth(10)))
// ThisText
// IsWayTooLong
```

Added in v0.0.1

## space

A document containing a single ` ` character.

**Signature**

```ts
export declare const space: Doc<never>
```

Added in v0.0.1

## squote

A document containing a single `'` character.

**Signature**

```ts
export declare const squote: Doc<never>
```

Added in v0.0.1

## squotes

Encloses the input document in single quotes (`''`).

**Signature**

```ts
export declare const squotes: <A>(doc: Doc<A>) => Doc<A>
```

Added in v0.0.1

## text

A document containing a string of text.

**Invariants**

- Text cannot be less than two characters long
- Text cannot contain a newline (`"\n"`) character

**Signature**

```ts
export declare const text: <A>(text: string) => Doc<A>
```

Added in v0.0.1

## vbar

A document containing a single `|` character.

**Signature**

```ts
export declare const vbar: Doc<never>
```

Added in v0.0.1

# reactive/conditional combinators

## column

The `column` combinator lays out a document depending upon the column at which
the document starts.

**Signature**

```ts
export declare const column: <A>(react: (position: number) => Doc<A>) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import * as RA from 'fp-ts/ReadonlyArray'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

// Example 1:
const example1 = D.column((l) => D.hsep([D.text('Columns are'), D.text(`${l}-based.`)]))

console.log(R.render(example1))
// Columns are 0-based.

// Example 2:
const doc = D.hsep([D.text('prefix'), D.column((l) => D.text(`| <- column ${l}`))])

const example2 = D.vsep(
  pipe(
    [0, 4, 8],
    RA.map((n) => D.indent(n)(doc))
  )
)

console.log(R.render(example2))
// prefix | <- column 7
//     prefix | <- column 11
//         prefix | <- column 15
```

Added in v0.0.1

## nesting

The `nesting` combinator lays out a document depending upon the current
nesting level (i.e., the current indentation of the document).

**Signature**

```ts
export declare const nesting: <A>(react: (level: number) => Doc<A>) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import * as RA from 'fp-ts/ReadonlyArray'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.hsep([D.text('prefix'), D.nesting((l) => D.brackets(D.text(`Nested: ${l}`)))])

const example = D.vsep(
  pipe(
    [0, 4, 8],
    RA.map((n) => D.indent(n)(doc))
  )
)

console.log(R.render(example))
// prefix [Nested: 0]
//     prefix [Nested: 4]
//         prefix [Nested: 8]
```

Added in v0.0.1

## pageWidth

The `pageWidth` combinator lays out a document according to the document's
`PageWidth`, if specified.

**Signature**

```ts
export declare const pageWidth: <A>(react: (pageWidth: PageWidth) => Doc<A>) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import * as RA from 'fp-ts/ReadonlyArray'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'
import * as PW from 'prettyprinter-ts/lib/PageWidth'

const doc = D.hsep([
  D.text('prefix'),
  D.pageWidth(
    PW.match({
      AvailablePerLine: (lw, rf) => D.brackets(D.text(`Width: ${lw}, ribbon fraction: ${rf}`)),
      Unbounded: () => D.empty,
    })
  ),
])

const example = D.vsep(
  pipe(
    [0, 4, 8],
    RA.map((n) => pipe(doc, D.indent(n)))
  )
)

console.log(pipe(example, R.renderWidth(32)))
// prefix [Width: 32, ribbon fraction: 1]
//     prefix [Width: 32, ribbon fraction: 1]
//         prefix [Width: 32, ribbon fraction: 1]
```

Added in v0.0.1

## width

The `width` combinator makes the column width of a document available to
the document while rendering.

**Signature**

```ts
export declare const width: <A>(react: (width: number) => Doc<A>) => (doc: Doc<A>) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import * as RA from 'fp-ts/ReadonlyArray'

import type { Doc } from 'prettyprinter-ts/lib/Doc'
import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const annotate = <A>(doc: Doc<A>): Doc<A> =>
  pipe(
    D.brackets(doc),
    D.width((w) => D.text(` <- width: ${w}`))
  )

const docs = [
  D.text('---'),
  D.text('------'),
  pipe(D.text('---'), D.indent(3)),
  D.vsep([D.text('---'), pipe(D.text('---'), D.indent(4))]),
]

const doc = D.align(D.vsep(pipe(docs, RA.map(annotate))))

console.log(R.render(doc))
// [---] <- width: 5
// [------] <- width: 8
// [   ---] <- width: 8
// [---
//     ---] <- width: 8
```

Added in v0.0.1

# sep combinators

## fillSep

The `fillSep` combinator concatenates all documents in a list horizontally by placing
a `space` between each pair of documents as long as they fit the page. Once the page
width is exceeded, a `line` is inserted and the process is repeated for all documents
in the list. **Note** that the use of `line` means that if `group`ed, the documents
will be separated with a `space` instead of newlines. See `fillCat` if you do not want
a `space`.

**Signature**

```ts
export declare const fillSep: <A>(docs: readonly Doc<A>[]) => Doc<A>
```

**Example**

```ts
import { intercalate } from 'fp-ts/Foldable'
import { pipe } from 'fp-ts/function'
import { monoidString } from 'fp-ts/Monoid'
import * as RA from 'fp-ts/ReadonlyArray'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const intercalateSpace = (xs: ReadonlyArray<string>): string => intercalate(monoidString, RA.Foldable)(' ', xs)

const words = pipe(RA.replicate(4, 'lorem ipsum dolor sit amet'), intercalateSpace, D.words)

const doc = D.hsep([D.text('Docs:'), D.fillSep(words)])

console.log(pipe(doc, R.renderWidth(80)))
// Docs: lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor
// sit amet lorem ipsum dolor sit amet

// If the page width is decreased to 40, printing the same document yields:
console.log(pipe(doc, R.renderWidth(40)))
// Docs: lorem ipsum dolor sit amet lorem
// ipsum dolor sit amet lorem ipsum dolor
// sit amet lorem ipsum dolor sit amet
```

Added in v0.0.1

## hsep

The `hsep` combinator concatenates all documents in a list horizontally by placing
a `space` between each pair of documents.

For automatic line breaks, consider using `fillSep`.

**Signature**

```ts
export declare const hsep: <A>(docs: readonly Doc<A>[]) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.hsep(D.words('lorem ipsum dolor sit amet'))

console.log(pipe(doc, R.renderWidth(80)))
// lorem ipsum dolor sit amet

// The `hsep` combinator will not introduce line breaks on its own, even when
// the page is too narrow
console.log(pipe(doc, R.renderWidth(5)))
// lorem ipsum dolor sit amet
```

Added in v0.0.1

## sep

The `sep` combinator will attempt to lay out a list of documents separated by `space`s.
If the output does not fit the page, then the documents will be separated by newlines.
This is what differentiates it from `vsep`, which always lays out documents beneath one
another.

**Signature**

```ts
export declare const sep: <A>(docs: readonly Doc<A>[]) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.hsep([D.text('prefix'), D.sep(D.words('text to lay out'))])

console.log(R.render(doc))
// prefix text to lay out

// If the page width is too narrow, documents are separated by newlines
console.log(pipe(doc, R.renderWidth(20)))
// prefix text
// to
// lay
// out
```

Added in v0.0.1

## vsep

The `vsep` combinator concatenates all documents in a list vertically. If a `group`
undoes the line breaks inserted by `vsep`, the documents are separated with a space
instead.

When a `vsep` is `group`ed, the documents are separated with a `space` if the layout
fits the page, otherwise nothing is done. See the `sep` convenience function for this
use case.

**Signature**

```ts
export declare const vsep: <A>(docs: readonly Doc<A>[]) => Doc<A>
```

**Example**

```ts
import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const unaligned = D.hsep([D.text('prefix'), D.vsep(D.words('text to lay out'))])

console.log(R.render(unaligned))
// prefix text
// to
// lay
// out

// The `align` function can be used to align the documents under their first element
const aligned = D.hsep([D.text('prefix'), D.align(D.vsep(D.words('text to lay out')))])

console.log(R.render(aligned))
// prefix text
//        to
//        lay
//        out
```

Added in v0.0.1

# utils

## alterAnnotations

Change the annotations of a document. Individual annotations can be
removed, changed, or replaced by multiple ones.

This is a general function that combines `unAnnotate` and `reAnnotate`,
and is useful for mapping semantic annotations (such as »this is a keyword«)
to display annotations (such as »this is red and underlined«) because some
backends may not care about certain annotations while others may.

Annotations earlier in the new list will be applied earlier, so returning
`[Bold, Green]` will result in a bold document that contains green text,
and not vice versa.

Since this traverses the entire document tree, including the parts that are
not rendered (due to other layouts having better fit), it is preferable to
reannotate a document **after** producing the layout by using
`alterAnnotationsS` from the `SimpleDocStream` module.

**Signature**

```ts
export declare const alterAnnotations: <A, B>(f: (a: A) => readonly B[]) => (doc: Doc<A>) => Doc<B>
```

Added in v0.0.1

## annotate

Adds an annotation to a `Doc`. The annotation can then be used by the rendering
algorithm to, for example, add color to certain parts of the output.

**Note** This function is relevant only for custom formats with their own annotations,
and is not relevant for basic pretty printing.

**Signature**

```ts
export declare const annotate: <A>(annotation: A) => (doc: Doc<A>) => Doc<A>
```

Added in v0.0.1

## reAnnotate

Changes the annotation of a document. Useful for modifying documents embedded
with one form of annotation with a more general annotation.

**Note** that with each invocation, the entire document tree is traversed.
If possible, it is preferable to reannotate a document after producing the
layout using `reAnnotateS`.

**Signature**

```ts
export declare const reAnnotate: <A, B>(f: (a: A) => B) => (doc: Doc<A>) => Doc<B>
```

**Example**

```ts
// TODO examples
```

Added in v0.0.1

## reflow

Splits a string of words into individual `Text` documents using the
specified `char` to split on (defaults to `' '`). In addition, a
`softLine` is inserted in between each word so that if the text
exceeds the available width it will be broken into multiple lines.

**Signature**

```ts
export declare const reflow: <A>(s: string, char?: string) => Doc<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.reflow(
  'Lorem ipsum dolor sit amet, consectetur adipisicing elit, ' +
    'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
)

console.log(pipe(doc, R.renderWidth(32)))
// Lorem ipsum dolor sit amet,
// consectetur adipisicing elit,
// sed do eiusmod tempor incididunt
// ut labore et dolore magna
// aliqua.
```

Added in v0.0.1

## textSpaces

Constructs a string containing `n` space characters.

**Signature**

```ts
export declare const textSpaces: (n: number) => string
```

Added in v0.0.1

## unAnnotate

Removes all annotations from a document.

**Note** that with each invocation, the entire document tree is traversed.
If possible, it is preferable to unannotate a document after producing the
layout using `unAnnotateS`.

**Signature**

```ts
export declare const unAnnotate: <A>(doc: Doc<A>) => Doc<never>
```

**Example**

```ts
// TODO examples
```

Added in v0.0.1

## words

Splits a string of words into individual `Text` documents using the
specified `char` to split on (defaults to `' '`).

**Signature**

```ts
export declare const words: <A>(s: string, char?: string) => readonly Doc<A>[]
```

**Example**

```ts
import * as D from 'prettyprinter-ts/lib/Doc'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = D.tupled(D.words('Lorem ipsum dolor'))

console.log(R.render(doc))
// (lorem, ipsum, dolor)
```

Added in v0.0.1
