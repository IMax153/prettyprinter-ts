---
title: PageWidth.ts
nav_order: 5
parent: Modules
---

## PageWidth overview

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [AvailablePerLine](#availableperline)
  - [Unbounded](#unbounded)
  - [defaultPageWidth](#defaultpagewidth)
- [destructors](#destructors)
  - [match](#match)
- [model](#model)
  - [AvailablePerLine (interface)](#availableperline-interface)
  - [PageWidth (type alias)](#pagewidth-type-alias)
  - [Unbounded (interface)](#unbounded-interface)
- [utils](#utils)
  - [remainingWidth](#remainingwidth)

---

# constructors

## AvailablePerLine

**Signature**

```ts
export declare const AvailablePerLine: (lineWidth: number, ribbonFraction: number) => PageWidth
```

Added in v0.0.1

## Unbounded

**Signature**

```ts
export declare const Unbounded: PageWidth
```

Added in v0.0.1

## defaultPageWidth

**Signature**

```ts
export declare const defaultPageWidth: PageWidth
```

Added in v0.0.1

# destructors

## match

**Signature**

```ts
export declare const match: <R>(patterns: {
  readonly AvailablePerLine: (lineWidth: number, ribbonFraction: number) => R
  readonly Unbounded: () => R
}) => (pageWidth: PageWidth) => R
```

Added in v0.0.1

# model

## AvailablePerLine (interface)

Represents a `PageWidth` setting that informs the layout
algorithms to avoid exceeding the specified space per line.

**Signature**

```ts
export interface AvailablePerLine {
  readonly _tag: 'AvailablePerLine'
  /**
   * The number of characters, including whitespace, that can fit
   * on a single line.
   */
  readonly lineWidth: number
  /**
   * The fraction of the total page width that can be printed on.
   * This allows limiting the length of printable text per line.
   * Values must be between `0` and `1` (`0.4` to `1` is typical).
   */
  readonly ribbonFraction: number
}
```

Added in v0.0.1

## PageWidth (type alias)

Represents the maximum number of characters that fit onto a
single line in a document. The layout algorithms will try to
avoid exceeding the set character limit by inserting line
breaks where appropriate (e.g., via `softLine`).

**Signature**

```ts
export type PageWidth = AvailablePerLine | Unbounded
```

Added in v0.0.1

## Unbounded (interface)

Represents a `PageWidth` setting that informs the layout
algorithms to avoid introducing line breaks into a document.

**Signature**

```ts
export interface Unbounded {
  readonly _tag: 'Unbounded'
}
```

Added in v0.0.1

# utils

## remainingWidth

Calculates the remaining width on the current line.

**Signature**

```ts
export declare const remainingWidth: (
  lineLength: number,
  ribbonFraction: number,
  lineIndent: number,
  currentColumn: number
) => number
```

Added in v0.0.1
