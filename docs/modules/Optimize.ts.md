---
title: Optimize.ts
nav_order: 4
parent: Modules
---

## Optimize overview

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [Deep](#deep)
  - [Shallow](#shallow)
- [model](#model)
  - [Deep (type alias)](#deep-type-alias)
  - [FusionDepth (type alias)](#fusiondepth-type-alias)
  - [Optimize (type alias)](#optimize-type-alias)
  - [Shallow (type alias)](#shallow-type-alias)
- [optimizers](#optimizers)
  - [optimize](#optimize)

---

# constructors

## Deep

**Signature**

```ts
export declare const Deep: FusionDepth
```

Added in v0.0.1

## Shallow

**Signature**

```ts
export declare const Shallow: FusionDepth
```

Added in v0.0.1

# model

## Deep (type alias)

Instructs the document fusion optimizer to recurse into all leaves of the document
tree, including different layout alternatives and all location-sensitive values
(i.e. those created by `nesting`), which cannot be fused before, but only during,
the layout process. As a result, the performance cost of using deep document fusion
optimization is often hard to predict and depends on the interplay between page
layout and the document that is to be pretty printed.

This value should only be utilized if profiling demonstrates that it is
**significantly** faster than using `Shallow`.

**Signature**

```ts
export type Deep = 'Deep'
```

Added in v0.0.1

## FusionDepth (type alias)

Represents an instruction that determines how deeply the document fusion optimizer
should traverse the document tree.

**Signature**

```ts
export type FusionDepth = Shallow | Deep
```

Added in v0.0.1

## Optimize (type alias)

Represents optimization of a given document tree through fusion of redundant
document nodes.

**Signature**

```ts
export type Optimize<A> = Reader<FusionDepth, D.Doc<A>>
```

Added in v0.0.1

## Shallow (type alias)

Instructs the document fusion optimizer to avoid diving deeply into nested
documents, fusing mostly concatenations of text nodes together.

**Signature**

```ts
export type Shallow = 'Shallow'
```

Added in v0.0.1

# optimizers

## optimize

The `optimizer` will combine text nodes so that they can be rendered more
efficiently. An optimized document is always laid out in an identical manner to its
un-optimized counterpart.

When laying a `Doc` out to a `SimpleDocStream`, every component of the input
document is translated directly to the simpler output format. This sometimes
yields undesirable chunking when many pieces have been concatenated together.

For example:

```ts
const foldDocs = M.fold(D.getMonoid<never>())
foldDocs([D.Char('a'), D.Char('b'), D.Char('c'), D.Char('d')])
// => abcd
```

results in a chain of four entries in the output `SimpleDocStream`, although
this is fully equivalent to the tightly packed

```typescript
D.Text('abcd')
// => abcd
```

which is only a single entry in the output `SimpleDocStream`, and can be processed
much more efficiently.

It is therefore a good idea to run `fuse` on concatenations of lots of small
strings that are used many times.

**Signature**

```ts
export declare const optimize: <A>(doc: Doc<A>) => Optimize<A>
```

Added in v0.0.1
