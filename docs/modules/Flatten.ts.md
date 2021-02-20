---
title: Flatten.ts
nav_order: 2
parent: Modules
---

## Flatten overview

Because certain documents do not change after removal of newlines, etc,
there is no point in creating a `Union` of the flattened and unflattened
versions. All this leads to is the introduction of two possible branches
for a layout algorithm to take, resulting in potentially exponential
behavior on deeply nested examples.

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [Functor](#functor)
  - [map](#map)
- [constructors](#constructors)
  - [AlreadyFlat](#alreadyflat)
  - [Flattened](#flattened)
  - [NeverFlat](#neverflat)
- [destructors](#destructors)
  - [match](#match)
- [instances](#instances)
  - [Functor](#functor-1)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
- [model](#model)
  - [AlreadyFlat (interface)](#alreadyflat-interface)
  - [FlattenResult (type alias)](#flattenresult-type-alias)
  - [Flattened (interface)](#flattened-interface)
  - [NeverFlat (interface)](#neverflat-interface)
- [utils](#utils)
  - [changesUponFlattening](#changesuponflattening)

---

# Functor

## map

**Signature**

```ts
export declare const map: <A, B>(f: (a: A) => B) => (fa: FlattenResult<A>) => FlattenResult<B>
```

Added in v0.0.1

# constructors

## AlreadyFlat

**Signature**

```ts
export declare const AlreadyFlat: FlattenResult<never>
```

Added in v0.0.1

## Flattened

**Signature**

```ts
export declare const Flattened: <A>(value: A) => FlattenResult<A>
```

Added in v0.0.1

## NeverFlat

**Signature**

```ts
export declare const NeverFlat: FlattenResult<never>
```

Added in v0.0.1

# destructors

## match

**Signature**

```ts
export declare const match: <A, R>(patterns: {
  readonly Flattened: (value: A) => R
  readonly AlreadyFlat: () => R
  readonly NeverFlat: () => R
}) => (flattenResult: FlattenResult<A>) => R
```

Added in v0.0.1

# instances

## Functor

**Signature**

```ts
export declare const Functor: Functor1<'prettyprinter-ts/FlattenResult'>
```

Added in v0.0.1

## URI

**Signature**

```ts
export declare const URI: 'prettyprinter-ts/FlattenResult'
```

Added in v0.0.1

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v0.0.1

# model

## AlreadyFlat (interface)

Represents a `FlattenResult` where the input was already flat.

**Signature**

```ts
export interface AlreadyFlat {
  readonly _tag: 'AlreadyFlat'
}
```

Added in v0.0.1

## FlattenResult (type alias)

**Signature**

```ts
export type FlattenResult<A> = Flattened<A> | AlreadyFlat | NeverFlat
```

Added in v0.0.1

## Flattened (interface)

Represents a `FlattenResult` where `A` is likely flatter than the input.

**Signature**

```ts
export interface Flattened<A> {
  readonly _tag: 'Flattened'
  readonly value: A
}
```

Added in v0.0.1

## NeverFlat (interface)

Represents a `FlattenResult` where the input cannot be flattened.

**Signature**

```ts
export interface NeverFlat {
  readonly _tag: 'NeverFlat'
}
```

Added in v0.0.1

# utils

## changesUponFlattening

Select the first element of each `Union` and discard the first element
of each `FlatAlt` to produce a "flattened" version of the input document.

The result is `Flattened` if the element might change depending on the
chosen layout algorithm (i.e., the resulting document contains
sub-documents that may be rendered differently).

The result is `AlreadyFlat` if the document is static (i.e., the resulting
document contains only a plain `Empty` node).

`NeverFlat` is returned when the document cannot be flattened because it
contains either a hard `Line` or a `Fail`.

**Signature**

```ts
export declare const changesUponFlattening: <A>(doc: Doc<A>) => FlattenResult<Doc<A>>
```

Added in v0.0.1
