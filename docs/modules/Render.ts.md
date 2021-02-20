---
title: Render.ts
nav_order: 6
parent: Modules
---

## Render overview

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [rendering algorithms](#rendering-algorithms)
  - [render](#render)
  - [renderS](#renders)
  - [renderUnbounded](#renderunbounded)
  - [renderWidth](#renderwidth)

---

# rendering algorithms

## render

**Signature**

```ts
export declare const render: <A>(doc: Doc<A>) => string
```

Added in v0.0.1

## renderS

**Signature**

```ts
export declare const renderS: <A>(stream: SimpleDocStream<A>) => string
```

Added in v0.0.1

## renderUnbounded

**Signature**

```ts
export declare const renderUnbounded: <A>(doc: Doc<A>) => string
```

Added in v0.0.1

## renderWidth

**Signature**

```ts
export declare const renderWidth: (lineWidth: number, ribbonFraction?: number) => <A>(doc: Doc<A>) => string
```

Added in v0.0.1
