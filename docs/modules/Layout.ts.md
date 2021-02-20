---
title: Layout.ts
nav_order: 3
parent: Modules
---

## Layout overview

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [Cons](#cons)
  - [LayoutOptions](#layoutoptions)
  - [Nil](#nil)
  - [UndoAnn](#undoann)
  - [defaultLayoutOptions](#defaultlayoutoptions)
- [destructors](#destructors)
  - [match](#match)
- [layout algorithms](#layout-algorithms)
  - [layoutCompact](#layoutcompact)
  - [layoutPretty](#layoutpretty)
  - [layoutSmart](#layoutsmart)
  - [layoutUnbounded](#layoutunbounded)
- [model](#model)
  - [Cons (interface)](#cons-interface)
  - [FittingPredicate (type alias)](#fittingpredicate-type-alias)
  - [Layout (interface)](#layout-interface)
  - [LayoutOptions (interface)](#layoutoptions-interface)
  - [LayoutPipeline (type alias)](#layoutpipeline-type-alias)
  - [Nil (interface)](#nil-interface)
  - [UndoAnn (interface)](#undoann-interface)

---

# constructors

## Cons

**Signature**

```ts
export declare const Cons: <A>(indentation: number, document: Doc<A>, pipeline: LayoutPipeline<A>) => LayoutPipeline<A>
```

Added in v0.0.1

## LayoutOptions

**Signature**

```ts
export declare const LayoutOptions: (pageWidth: PageWidth) => LayoutOptions
```

Added in v0.0.1

## Nil

**Signature**

```ts
export declare const Nil: LayoutPipeline<never>
```

Added in v0.0.1

## UndoAnn

**Signature**

```ts
export declare const UndoAnn: <A>(pipeline: LayoutPipeline<A>) => LayoutPipeline<A>
```

Added in v0.0.1

## defaultLayoutOptions

The default layout options, which are suitable when you want to obtain output
but do not care about the details.

Defaults to:

```ts
{
  pageWidth: AvailablePerWidth(80, 1)
}
```

**Signature**

```ts
export declare const defaultLayoutOptions: LayoutOptions
```

Added in v0.0.1

# destructors

## match

**Signature**

```ts
export declare const match: <A, R>(patterns: {
  readonly Nil: () => R
  readonly Cons: (indentation: number, document: Doc<A>, pipeline: LayoutPipeline<A>) => R
  readonly UndoAnn: (pipeline: LayoutPipeline<A>) => R
}) => (pipeline: LayoutPipeline<A>) => R
```

Added in v0.0.1

# layout algorithms

## layoutCompact

A layout algorithm which will lay out a document without adding any
indentation and without preserving annotations.

Since no pretty-printing is involved, this layout algorithm is ver fast. The
resulting output contains fewer characters than a pretty-printed version and
can be used for output that is read by other programs.

**Signature**

```ts
export declare const layoutCompact: <A, B>(doc: Doc<A>) => SimpleDocStream<B>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'

import * as D from 'prettyprinter-ts/lib/Doc'
import * as L from 'prettyprinter-ts/lib/Layout'
import * as R from 'prettyprinter-ts/lib/Render'

const doc = pipe(
  D.vsep([D.text('lorem'), D.text('ipsum'), pipe(D.vsep([D.text('dolor'), D.text('sit')]), D.hang(4))]),
  D.hang(4)
)

console.log(R.render(doc))
// lorem
//     ipsum
//     dolor
//         sit

console.log(pipe(doc, L.layoutCompact, R.renderS))
// lorem
// ipsum
// dolor
// sit
```

Added in v0.0.1

## layoutPretty

The `layoutPretty` layout algorithm is the default algorithm for rendering
documents.

`layoutPretty` commites to rendering something in a certain way if the next
element fits the layout constrants. In other words, it has one `SimpleDocStream`
element lookahead when rendering.

Consider using the smarter, but slightly less performant `layoutSmart`
algorithm if the results seem to run off to the right before having lots of
line breaks.

**Signature**

```ts
export declare const layoutPretty: <A>(doc: Doc<A>) => Layout<A>
```

Added in v0.0.1

## layoutSmart

A layout algorithm with more look ahead than `layoutPretty`, which will introduce
line breaks into a document earlier if the content does not, or will not, fit onto
one line.

**Signature**

```ts
export declare const layoutSmart: <A>(doc: Doc<A>) => Layout<A>
```

**Example**

```ts
import { flow, pipe } from 'fp-ts/function'
import * as M from 'fp-ts/Monoid'
import * as RA from 'fp-ts/ReadonlyArray'

import type { Doc } from 'prettyprinter-ts/lib/Doc'
import * as D from 'prettyprinter-ts/lib/Doc'
import type { Layout, LayoutOptions } from 'prettyprinter-ts/lib/Layout'
import * as L from 'prettyprinter-ts/lib/Layout'
import type { PageWidth } from 'prettyprinter-ts/lib/PageWidth'
import * as PW from 'prettyprinter-ts/lib/PageWidth'
import * as R from 'prettyprinter-ts/lib/Render'

// Consider the following python-ish document:
const fun = <A>(doc: Doc<A>): Doc<A> =>
  D.hcat([
    pipe(
      D.hcat<A>([D.text('fun('), D.softLineBreak, doc]),
      D.hang(2)
    ),
    D.text(')'),
  ])

const funs = flow(fun, fun, fun, fun, fun)

const doc: Doc<never> = funs(D.align(D.list(D.words('abcdef ghijklm'))))

// The document will be rendered using the following pipeline, where the choice
// of layout algorithm has been left open:
const dashes: Doc<never> = D.text(pipe(RA.replicate(26 - 2, '-'), M.fold(M.monoidString)))
const hr: Doc<never> = D.hcat([D.vbar, dashes, D.vbar])

const pageWidth: PageWidth = PW.AvailablePerLine(26, 1)
const layoutOptions: LayoutOptions = L.LayoutOptions(pageWidth)

const render = <A>(doc: Doc<A>) => (layoutAlgorithm: (doc: Doc<A>) => Layout<A>): string =>
  pipe(
    layoutOptions,
    layoutAlgorithm(
      D.vsep<A>([hr, doc, hr])
    ),
    R.renderS
  )

// If rendered using `layoutPretty`, with a page width of `26` characters per line,
// all the calls to `fun` will fit into the first line. However, this exceeds the
// desired `26` character page width.
console.log(pipe(L.layoutPretty, render(doc)))
// |------------------------|
// fun(fun(fun(fun(fun(
//                   [ abcdef
//                   , ghijklm ])))))
// |------------------------|

// The same document, rendered with `layoutSmart`, fits the layout contstraints:
console.log(pipe(L.layoutSmart, render(doc)))
// |------------------------|
// fun(
//   fun(
//     fun(
//       fun(
//         fun(
//           [ abcdef
//           , ghijklm ])))))
// |------------------------|

// The key difference between `layoutPretty` and `layoutSmart` is that the
// latter will check the potential document until it encounters a line with the
// same indentation or less than the start of the document. Any line encountered
// earlier is assumed to belong to the same syntactic structure. In contrast,
// `layoutPretty` checks only the first line.

// Consider for example the question of whether the `A`s fit into the document
// below:
// > 1 A
// > 2   A
// > 3  A
// > 4 B
// > 5   B

// `layoutPretty` will check only the first line, ignoring whether the second line
// may already be too wide. In contrast, `layoutSmart` stops only once it reaches
// the fourth line 4, where the `B` has the same indentation as the first `A`.
```

Added in v0.0.1

## layoutUnbounded

The `layoutUnbounded` layout algorithm will lay out a document an
`Unbounded` page width.

**Signature**

```ts
export declare const layoutUnbounded: <A>(doc: Doc<A>) => SimpleDocStream<A>
```

Added in v0.0.1

# model

## Cons (interface)

**Signature**

```ts
export interface Cons<A> {
  readonly _tag: 'Cons'
  readonly indentation: number
  readonly document: Doc<A>
  readonly pipeline: LayoutPipeline<A>
}
```

Added in v0.0.1

## FittingPredicate (type alias)

Decides whether a `SimpleDocStream` fits the given constraints, namely:

- original indentation of the current
- current column
- initial indentation of the alternative `SimpleDocStream` if it starts with
  a line break (used by `layoutSmart`)
- width in which to fit the first line

**Signature**

```ts
export type FittingPredicate<A> = (
  lineIndent: number,
  currentColumn: number,
  initialIndentY: Option<number>,
  stream: SimpleDocStream<A>
) => boolean
```

Added in v0.0.1

## Layout (interface)

**Signature**

```ts
export interface Layout<A> extends Reader<LayoutOptions, SimpleDocStream<A>> {}
```

Added in v0.0.1

## LayoutOptions (interface)

Represents the options that will influence the layout algorithms.

**Signature**

```ts
export interface LayoutOptions {
  readonly pageWidth: PageWidth
}
```

Added in v0.0.1

## LayoutPipeline (type alias)

Represents a list of nesting level/document pairs that are yet to be laid out.

**Signature**

```ts
export type LayoutPipeline<A> = Nil | Cons<A> | UndoAnn<A>
```

Added in v0.0.1

## Nil (interface)

**Signature**

```ts
export interface Nil {
  readonly _tag: 'Nil'
}
```

Added in v0.0.1

## UndoAnn (interface)

**Signature**

```ts
export interface UndoAnn<A> {
  readonly _tag: 'UndoAnn'
  readonly pipeline: LayoutPipeline<A>
}
```

Added in v0.0.1
