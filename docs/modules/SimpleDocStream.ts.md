---
title: SimpleDocStream.ts
nav_order: 7
parent: Modules
---

## SimpleDocStream overview

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [Foldable](#foldable)
  - [foldMap](#foldmap)
- [Functor](#functor)
  - [map](#map)
- [Traversable](#traversable)
  - [traverse](#traverse)
- [constructors](#constructors)
  - [SAnnPop](#sannpop)
  - [SAnnPush](#sannpush)
  - [SChar](#schar)
  - [SEmpty](#sempty)
  - [SFail](#sfail)
  - [SLine](#sline)
  - [SText](#stext)
- [destructors](#destructors)
  - [match](#match)
- [instances](#instances)
  - [Functor](#functor-1)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
- [model](#model)
  - [SAnnPop (interface)](#sannpop-interface)
  - [SAnnPush (interface)](#sannpush-interface)
  - [SChar (interface)](#schar-interface)
  - [SEmpty (interface)](#sempty-interface)
  - [SFail (interface)](#sfail-interface)
  - [SLine (interface)](#sline-interface)
  - [SText (interface)](#stext-interface)
  - [SimpleDocStream (type alias)](#simpledocstream-type-alias)
- [utils](#utils)
  - [alterAnnotationS](#alterannotations)
  - [reAnnotateS](#reannotates)
  - [removeTrailingWhitespace](#removetrailingwhitespace)
  - [unAnnotateS](#unannotates)

---

# Foldable

## foldMap

**Signature**

```ts
export declare const foldMap: <M>(M: Monoid<M>) => <A>(f: (a: A) => M) => (fa: SimpleDocStream<A>) => M
```

Added in v0.0.1

# Functor

## map

**Signature**

```ts
export declare const map: <A, B>(f: (a: A) => B) => (fa: SimpleDocStream<A>) => SimpleDocStream<B>
```

Added in v0.0.1

# Traversable

## traverse

**Signature**

```ts
export declare const traverse: PipeableTraverse1<'prettyprinter-ts/SimpleDocStream'>
```

Added in v0.0.1

# constructors

## SAnnPop

**Signature**

```ts
export declare const SAnnPop: <A>(stream: SimpleDocStream<A>) => SimpleDocStream<A>
```

Added in v0.0.1

## SAnnPush

**Signature**

```ts
export declare const SAnnPush: <A>(annotation: A, stream: SimpleDocStream<A>) => SimpleDocStream<A>
```

Added in v0.0.1

## SChar

**Signature**

```ts
export declare const SChar: <A>(char: string, stream: SimpleDocStream<A>) => SimpleDocStream<A>
```

Added in v0.0.1

## SEmpty

**Signature**

```ts
export declare const SEmpty: SimpleDocStream<never>
```

Added in v0.0.1

## SFail

**Signature**

```ts
export declare const SFail: SimpleDocStream<never>
```

Added in v0.0.1

## SLine

**Signature**

```ts
export declare const SLine: <A>(indentation: number, stream: SimpleDocStream<A>) => SimpleDocStream<A>
```

Added in v0.0.1

## SText

**Signature**

```ts
export declare const SText: <A>(text: string, stream: SimpleDocStream<A>) => SimpleDocStream<A>
```

Added in v0.0.1

# destructors

## match

**Signature**

```ts
export declare const match: <A, R>(patterns: {
  readonly SFail: () => R
  readonly SEmpty: () => R
  readonly SChar: (char: string, stream: SimpleDocStream<A>) => R
  readonly SText: (text: string, stream: SimpleDocStream<A>) => R
  readonly SLine: (indentation: number, stream: SimpleDocStream<A>) => R
  readonly SAnnPush: (annotation: A, stream: SimpleDocStream<A>) => R
  readonly SAnnPop: (stream: SimpleDocStream<A>) => R
}) => (simpleDocStream: SimpleDocStream<A>) => R
```

Added in v0.0.1

# instances

## Functor

**Signature**

```ts
export declare const Functor: Functor1<'prettyprinter-ts/SimpleDocStream'>
```

Added in v0.0.1

## URI

**Signature**

```ts
export declare const URI: 'prettyprinter-ts/SimpleDocStream'
```

Added in v0.0.1

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v0.0.1

# model

## SAnnPop (interface)

Represents the removal of a previously pushed annotation from a `Doc`.

**Signature**

```ts
export interface SAnnPop<A> {
  readonly _tag: 'SAnnPop'
  readonly stream: SimpleDocStream<A>
}
```

Added in v0.0.1

## SAnnPush (interface)

Represents the addition of an annotation of type `A` to a `Doc`.

**Signature**

```ts
export interface SAnnPush<A> {
  readonly _tag: 'SAnnPush'
  readonly annotation: A
  readonly stream: SimpleDocStream<A>
}
```

Added in v0.0.1

## SChar (interface)

Represents a `Doc` containing a single character.

**Signature**

```ts
export interface SChar<A> {
  readonly _tag: 'SChar'
  readonly char: string
  readonly stream: SimpleDocStream<A>
}
```

Added in v0.0.1

## SEmpty (interface)

Represents the an empty `Doc`.

**Signature**

```ts
export interface SEmpty {
  readonly _tag: 'SEmpty'
}
```

Added in v0.0.1

## SFail (interface)

Represents a `Doc` that failed to be laid out.

**Signature**

```ts
export interface SFail {
  readonly _tag: 'SFail'
}
```

Added in v0.0.1

## SLine (interface)

Represents a `Doc` containing a single line. The `indentation`
represents the indentation level for the subsequent line in the
`Doc`.

**Signature**

```ts
export interface SLine<A> {
  readonly _tag: 'SLine'
  readonly indentation: number
  readonly stream: SimpleDocStream<A>
}
```

Added in v0.0.1

## SText (interface)

Represents a `Doc` containing a string of text.

**Signature**

```ts
export interface SText<A> {
  readonly _tag: 'SText'
  readonly text: string
  readonly stream: SimpleDocStream<A>
}
```

Added in v0.0.1

## SimpleDocStream (type alias)

Represents a document that has been laid out and can be processed used
by the rendering algorithms.

A simplified view is that a `Doc` is equivalent to an array of
`SimpleDocStream`, and the layout algorithms simply pick a
`SimpleDocStream` based upon which instance best fits the layout
constraints. Therefore, a `SimpleDocStream` has all complexity contained
in a `Doc` resolved, making it very easy to convert to other formats,
such as plaintext or terminal output.

**Signature**

```ts
export type SimpleDocStream<A> = SFail | SEmpty | SChar<A> | SText<A> | SLine<A> | SAnnPush<A> | SAnnPop<A>
```

Added in v0.0.1

# utils

## alterAnnotationS

Changes the annotation of a document to a different annotation, or
none at all.

**Signature**

```ts
export declare const alterAnnotationS: <A, B>(
  f: (a: A) => Option<B>
) => (stream: SimpleDocStream<A>) => SimpleDocStream<B>
```

Added in v0.0.1

## reAnnotateS

Modify the annotations of a document.

**Signature**

```ts
export declare const reAnnotateS: <A, B>(f: (a: A) => B) => (stream: SimpleDocStream<A>) => SimpleDocStream<B>
```

Added in v0.0.1

## removeTrailingWhitespace

Remove all trailing space characters.

This utility has some performance impact as it requires an additional
pass over the entire `SimpleDocStream`.

No trimming is performed inside annotated documents, which are considered
to have no (trimmable) whitespace given that the annotation may relate to
the whitespace in the document. For example, a renderer that colors the
background of trailing whitespace (e.g., as `git diff` can be configured
to do).

**Signature**

```ts
export declare const removeTrailingWhitespace: <A>(stream: SimpleDocStream<A>) => SimpleDocStream<A>
```

Added in v0.0.1

## unAnnotateS

Remove all annotations from a document.

**Signature**

```ts
export declare const unAnnotateS: <A>(stream: SimpleDocStream<A>) => SimpleDocStream<void>
```

Added in v0.0.1
