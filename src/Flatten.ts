/**
 * Because certain documents do not change after removal of newlines, etc,
 * there is no point in creating a `Union` of the flattened and unflattened
 * versions. All this leads to is the introduction of two possible branches
 * for a layout algorithm to take, resulting in potentially exponential
 * behavior on deeply nested examples.
 *
 * @since 0.0.1
 */
import { absurd, flow, pipe } from 'fp-ts/function'
import { Functor1 } from 'fp-ts/Functor'

import type { Doc } from './Doc'
import * as D from './Doc'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.0.1
 */
export type FlattenResult<A> = Flattened<A> | AlreadyFlat | NeverFlat

/**
 * Represents a `FlattenResult` where `A` is likely flatter than the input.
 *
 * @category model
 * @since 0.0.1
 */
export interface Flattened<A> {
  readonly _tag: 'Flattened'
  readonly value: A
}

/**
 * Represents a `FlattenResult` where the input was already flat.
 *
 * @category model
 * @since 0.0.1
 */
export interface AlreadyFlat {
  readonly _tag: 'AlreadyFlat'
}

/**
 * Represents a `FlattenResult` where the input cannot be flattened.
 *
 * @category model
 * @since 0.0.1
 */
export interface NeverFlat {
  readonly _tag: 'NeverFlat'
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 0.0.1
 */
export const Flattened = <A>(value: A): FlattenResult<A> => ({
  _tag: 'Flattened',
  value
})

/**
 * @category constructors
 * @since 0.0.1
 */
export const AlreadyFlat: FlattenResult<never> = {
  _tag: 'AlreadyFlat'
}

/**
 * @category constructors
 * @since 0.0.1
 */
export const NeverFlat: FlattenResult<never> = {
  _tag: 'NeverFlat'
}

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * @category destructors
 * @since 0.0.1
 */
export const fold = <A, R>(patterns: {
  readonly Flattened: (value: A) => R
  readonly AlreadyFlat: () => R
  readonly NeverFlat: () => R
}): ((flattenResult: FlattenResult<A>) => R) => {
  const f = (x: FlattenResult<A>): R => {
    switch (x._tag) {
      case 'Flattened':
        return patterns.Flattened(x.value)
      case 'AlreadyFlat':
        return patterns.AlreadyFlat()
      case 'NeverFlat':
        return patterns.NeverFlat()
      default:
        return absurd(x)
    }
  }
  return f
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
export const map = <A, B>(f: (a: A) => B): ((fa: FlattenResult<A>) => FlattenResult<B>) =>
  fold<A, FlattenResult<B>>({
    Flattened: (a) => Flattened(f(a)),
    AlreadyFlat: () => AlreadyFlat,
    NeverFlat: () => NeverFlat
  })

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * Flattens a document but does not report changes.
 */
const flatten = <A>(doc: Doc<A>): Doc<A> =>
  pipe(
    doc,
    D.fold<A, Doc<A>>({
      Fail: () => doc,
      Empty: () => doc,
      Char: () => doc,
      Text: () => doc,
      Line: () => D.Fail,
      FlatAlt: (_, y) => flatten(y),
      Cat: (x, y) => D.Cat(flatten(x), flatten(y)),
      Nest: (i, x) => D.Nest(i, flatten(x)),
      Union: (x) => flatten(x),
      Column: (f) => D.Column(flow(f, flatten)),
      WithPageWidth: (f) => D.WithPageWidth(flow(f, flatten)),
      Nesting: (f) => D.Nesting(flow(f, flatten)),
      Annotated: (a, x) => D.Annotated(a, flatten(x))
    })
  )

/**
 * Select the first element of each `Union` and discard the first element
 * of each `FlatAlt` to produce a "flattened" version of the input document.
 *
 * The result is `Flattened` if the element might change depending on the
 * chosen layout algorithm (i.e., the resulting document contains
 * sub-documents that may be rendered differently).
 *
 * The result is `AlreadyFlat` if the document is static (i.e., the resulting
 * document contains only a plain `Empty` node).
 *
 * `NeverFlat` is returned when the document cannot be flattened because it
 * contains either a hard `Line` or a `Fail`.
 *
 * @category utils
 * @since 0.0.1
 */
export const changesUponFlattening = <A>(doc: Doc<A>): FlattenResult<Doc<A>> =>
  pipe(
    doc,
    D.fold<A, FlattenResult<Doc<A>>>({
      Empty: () => AlreadyFlat,
      Char: () => AlreadyFlat,
      Text: () => AlreadyFlat,
      Fail: () => AlreadyFlat,
      Line: () => NeverFlat,
      FlatAlt: (_, y) => Flattened(flatten(y)),
      Cat: (x, y) => {
        const a = changesUponFlattening(x)
        const b = changesUponFlattening(y)

        if (a._tag === 'NeverFlat' || b._tag === 'NeverFlat') {
          return NeverFlat
        }
        if (a._tag === 'Flattened' && b._tag === 'Flattened') {
          return Flattened(D.Cat(a.value, b.value))
        }
        if (a._tag === 'Flattened' && b._tag === 'AlreadyFlat') {
          return Flattened(D.Cat(a.value, y))
        }
        if (a._tag === 'AlreadyFlat' && b._tag === 'Flattened') {
          return Flattened(D.Cat(x, b.value))
        }
        if (a._tag === 'AlreadyFlat' && b._tag === 'AlreadyFlat') {
          return AlreadyFlat
        }

        return absurd<FlattenResult<Doc<A>>>(NeverFlat as never)
      },
      Nest: (i, a) =>
        pipe(
          changesUponFlattening(a),
          map((b) => D.Nest(i, b))
        ),
      Union: (x) => Flattened(x),
      Column: (f) => Flattened(D.Column(flow(f, flatten))),
      WithPageWidth: (f) => Flattened(D.WithPageWidth(flow(f, flatten))),
      Nesting: (f) => Flattened(D.Column(flow(f, flatten))),
      Annotated: (a, x) =>
        pipe(
          changesUponFlattening(x),
          map((b) => D.Annotated(a, b))
        )
    })
  )

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 0.0.1
 */
export const URI = 'prettyprinter-ts/FlattenResult'

/**
 * @category instances
 * @since 0.0.1
 */
export type URI = typeof URI

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly [URI]: FlattenResult<A>
  }
}

/**
 * @category instances
 * @since 0.0.1
 */
export const Functor: Functor1<URI> = {
  URI,
  map: map_
}
