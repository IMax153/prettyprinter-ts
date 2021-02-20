/**
 * @since 0.0.1
 */
import type { Endomorphism } from 'fp-ts/function'
import { absurd, pipe } from 'fp-ts/function'
import * as Ord from 'fp-ts/Ord'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * Represents the maximum number of characters that fit onto a
 * single line in a document. The layout algorithms will try to
 * avoid exceeding the set character limit by inserting line
 * breaks where appropriate (e.g., via `softLine`).
 *
 * @category model
 * @since 0.0.1
 */
export type PageWidth = AvailablePerLine | Unbounded

/**
 * Represents a `PageWidth` setting that informs the layout
 * algorithms to avoid exceeding the specified space per line.
 *
 * @category model
 * @since 0.0.1
 */
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

/**
 * Represents a `PageWidth` setting that informs the layout
 * algorithms to avoid introducing line breaks into a document.
 *
 * @category model
 * @since 0.0.1
 */
export interface Unbounded {
  readonly _tag: 'Unbounded'
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 0.0.1
 */
export const AvailablePerLine = (lineWidth: number, ribbonFraction: number): PageWidth => ({
  _tag: 'AvailablePerLine',
  lineWidth,
  ribbonFraction
})

/**
 * @category constructors
 * @since 0.0.1
 */
export const Unbounded: PageWidth = {
  _tag: 'Unbounded'
}

/**
 * @category constructors
 * @since 0.0.1
 */
export const defaultPageWidth: PageWidth = AvailablePerLine(80, 1)

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * @category destructors
 * @since 0.0.1
 */
export const match = <R>(patterns: {
  readonly AvailablePerLine: (lineWidth: number, ribbonFraction: number) => R
  readonly Unbounded: () => R
}): ((pageWidth: PageWidth) => R) => {
  const f = (x: PageWidth): R => {
    switch (x._tag) {
      case 'AvailablePerLine':
        return patterns.AvailablePerLine(x.lineWidth, x.ribbonFraction)
      case 'Unbounded':
        return patterns.Unbounded()
      default:
        return absurd(x)
    }
  }
  return f
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

const min: (x: number) => (y: number) => number = (x) => (y) => Ord.min(Ord.ordNumber)(x, y)
const max: (x: number) => (y: number) => number = (x) => (y) => Ord.max(Ord.ordNumber)(x, y)
const floor: Endomorphism<number> = (x) => Math.floor(x)

/**
 * Calculates the remaining width on the current line.
 *
 * @category utils
 * @since 0.0.1
 */
export const remainingWidth = (
  lineLength: number,
  ribbonFraction: number,
  lineIndent: number,
  currentColumn: number
): number => {
  const columnsLeftInLine = lineLength - currentColumn
  const ribbonWidth = pipe(lineLength * ribbonFraction, floor, min(lineLength), max(0))
  const columnsLeftInRibbon = lineIndent + ribbonWidth - currentColumn
  return min(columnsLeftInLine)(columnsLeftInRibbon)
}
