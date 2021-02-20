/**
 * @since 0.0.1
 */
import type { Applicative } from 'fp-ts/Applicative'
import type { Endomorphism } from 'fp-ts/function'
import { absurd, constant, pipe } from 'fp-ts/function'
import type { Functor1 } from 'fp-ts/Functor'
import type { HKT } from 'fp-ts/HKT'
import type { Monoid } from 'fp-ts/Monoid'
import * as M from 'fp-ts/Monoid'
import type { Option } from 'fp-ts/Option'
import * as O from 'fp-ts/Option'
import * as RA from 'fp-ts/ReadonlyArray'
import type { PipeableTraverse1 } from 'fp-ts/Traversable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * Represents a document that has been laid out and can be processed used
 * by the rendering algorithms.
 *
 * A simplified view is that a `Doc` is equivalent to an array of
 * `SimpleDocStream`, and the layout algorithms simply pick a
 * `SimpleDocStream` based upon which instance best fits the layout
 * constraints. Therefore, a `SimpleDocStream` has all complexity contained
 * in a `Doc` resolved, making it very easy to convert to other formats,
 * such as plaintext or terminal output.
 *
 * @category model
 * @since 0.0.1
 */
export type SimpleDocStream<A> =
  | SFail
  | SEmpty
  | SChar<A>
  | SText<A>
  | SLine<A>
  | SAnnPush<A>
  | SAnnPop<A>

/**
 * Represents a `Doc` that failed to be laid out.
 *
 * @category model
 * @since 0.0.1
 */
export interface SFail {
  readonly _tag: 'SFail'
}

/**
 * Represents the an empty `Doc`.
 *
 * @category model
 * @since 0.0.1
 */
export interface SEmpty {
  readonly _tag: 'SEmpty'
}

/**
 * Represents a `Doc` containing a single character.
 *
 * @category model
 * @since 0.0.1
 */
export interface SChar<A> {
  readonly _tag: 'SChar'
  readonly char: string
  readonly stream: SimpleDocStream<A>
}

/**
 * Represents a `Doc` containing a string of text.
 *
 * @category model
 * @since 0.0.1
 */
export interface SText<A> {
  readonly _tag: 'SText'
  readonly text: string
  readonly stream: SimpleDocStream<A>
}

/**
 * Represents a `Doc` containing a single line. The `indentation`
 * represents the indentation level for the subsequent line in the
 * `Doc`.
 *
 * @category model
 * @since 0.0.1
 */
export interface SLine<A> {
  readonly _tag: 'SLine'
  readonly indentation: number
  readonly stream: SimpleDocStream<A>
}

/**
 * Represents the addition of an annotation of type `A` to a `Doc`.
 *
 * @category model
 * @since 0.0.1
 */
export interface SAnnPush<A> {
  readonly _tag: 'SAnnPush'
  readonly annotation: A
  readonly stream: SimpleDocStream<A>
}

/**
 * Represents the removal of a previously pushed annotation from a `Doc`.
 *
 * @category model
 * @since 0.0.1
 */
export interface SAnnPop<A> {
  readonly _tag: 'SAnnPop'
  readonly stream: SimpleDocStream<A>
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 0.0.1
 */
export const SFail: SimpleDocStream<never> = {
  _tag: 'SFail'
}

/**
 * @category constructors
 * @since 0.0.1
 */
export const SEmpty: SimpleDocStream<never> = {
  _tag: 'SEmpty'
}

/**
 * @category constructors
 * @since 0.0.1
 */
export const SChar = <A>(char: string, stream: SimpleDocStream<A>): SimpleDocStream<A> => ({
  _tag: 'SChar',
  char,
  stream
})

/**
 * @category constructors
 * @since 0.0.1
 */
export const SText = <A>(text: string, stream: SimpleDocStream<A>): SimpleDocStream<A> => ({
  _tag: 'SText',
  text,
  stream
})

/**
 * @category constructors
 * @since 0.0.1
 */
export const SLine = <A>(indentation: number, stream: SimpleDocStream<A>): SimpleDocStream<A> => ({
  _tag: 'SLine',
  indentation,
  stream
})

/**
 * @category constructors
 * @since 0.0.1
 */
export const SAnnPush = <A>(annotation: A, stream: SimpleDocStream<A>): SimpleDocStream<A> => ({
  _tag: 'SAnnPush',
  annotation,
  stream
})

/**
 * @category constructors
 * @since 0.0.1
 */
export const SAnnPop = <A>(stream: SimpleDocStream<A>): SimpleDocStream<A> => ({
  _tag: 'SAnnPop',
  stream
})

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * @category destructors
 * @since 0.0.1
 */
export const match = <A, R>(patterns: {
  readonly SFail: () => R
  readonly SEmpty: () => R
  readonly SChar: (char: string, stream: SimpleDocStream<A>) => R
  readonly SText: (text: string, stream: SimpleDocStream<A>) => R
  readonly SLine: (indentation: number, stream: SimpleDocStream<A>) => R
  readonly SAnnPush: (annotation: A, stream: SimpleDocStream<A>) => R
  readonly SAnnPop: (stream: SimpleDocStream<A>) => R
}): ((simpleDocStream: SimpleDocStream<A>) => R) => {
  const f = (x: SimpleDocStream<A>): R => {
    switch (x._tag) {
      case 'SFail':
        return patterns.SFail()
      case 'SEmpty':
        return patterns.SEmpty()
      case 'SChar':
        return patterns.SChar(x.char, x.stream)
      case 'SText':
        return patterns.SText(x.text, x.stream)
      case 'SLine':
        return patterns.SLine(x.indentation, x.stream)
      case 'SAnnPush':
        return patterns.SAnnPush(x.annotation, x.stream)
      case 'SAnnPop':
        return patterns.SAnnPop(x.stream)
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
export const map = <A, B>(f: (a: A) => B): ((fa: SimpleDocStream<A>) => SimpleDocStream<B>) =>
  reAnnotateS(f)

/**
 * @category Foldable
 * @since 0.0.1
 */
export const foldMap = <M>(M: Monoid<M>) => <A>(f: (a: A) => M): ((fa: SimpleDocStream<A>) => M) =>
  match({
    SFail: () => M.empty,
    SEmpty: () => M.empty,
    SChar: (_, rest) => pipe(rest, foldMap(M)(f)),
    SText: (_, rest) => pipe(rest, foldMap(M)(f)),
    SLine: (_, rest) => pipe(rest, foldMap(M)(f)),
    SAnnPush: (a, rest) => M.concat(f(a), pipe(rest, foldMap(M)(f))),
    SAnnPop: (rest) => pipe(rest, foldMap(M)(f))
  })

/**
 * @category Traversable
 * @since 0.0.1
 */
export const traverse: PipeableTraverse1<URI> = <F>(F: Applicative<F>) => <A, B>(
  f: (a: A) => HKT<F, B>
): ((ta: SimpleDocStream<A>) => HKT<F, SimpleDocStream<B>>) => {
  const go: (stream: SimpleDocStream<A>) => HKT<F, SimpleDocStream<B>> = match<
    A,
    HKT<F, SimpleDocStream<B>>
  >({
    SFail: () => F.of(SFail),
    SEmpty: () => F.of(SEmpty),
    SChar: (c, rest) => F.map(go(rest), (b) => SChar(c, b)),
    SText: (t, rest) => F.map(go(rest), (b) => SText(t, b)),
    SLine: (i, rest) => F.map(go(rest), (b) => SLine(i, b)),
    SAnnPush: (a, rest) =>
      F.ap(
        F.map(f(a), (b) => (ta: SimpleDocStream<B>) => SAnnPush(b, ta)),
        go(rest)
      ),
    SAnnPop: (rest) => F.map(go(rest), (b) => SAnnPop(b))
  })
  return go
}
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * Modify the annotations of a document.
 *
 * @category utils
 * @since 0.0.1
 */
export const reAnnotateS = <A, B>(
  f: (a: A) => B
): ((stream: SimpleDocStream<A>) => SimpleDocStream<B>) =>
  match<A, SimpleDocStream<B>>({
    SFail: () => SFail,
    SEmpty: () => SEmpty,
    SChar: (c, rest) => SChar(c, reAnnotateS(f)(rest)),
    SText: (t, rest) => SText(t, reAnnotateS(f)(rest)),
    SLine: (i, rest) => SLine(i, reAnnotateS(f)(rest)),
    SAnnPop: (rest) => reAnnotateS(f)(rest),
    SAnnPush: (a, rest) => SAnnPush(f(a), reAnnotateS(f)(rest))
  })

/**
 * Remove all annotations from a document.
 *
 * @category utils
 * @since 0.0.1
 */
export const unAnnotateS = <A>(stream: SimpleDocStream<A>): SimpleDocStream<void> =>
  pipe(
    stream,
    match<A, SimpleDocStream<void>>({
      SFail: () => SFail,
      SEmpty: () => SEmpty,
      SChar: (c, rest) => SChar(c, unAnnotateS(rest)),
      SText: (t, rest) => SText(t, unAnnotateS(rest)),
      SLine: (i, rest) => SLine(i, unAnnotateS(rest)),
      SAnnPop: (rest) => unAnnotateS(rest),
      SAnnPush: (_, rest) => unAnnotateS(rest)
    })
  )

type AnnotationRemoval = 'Remove' | 'DontRemove'

const Remove: AnnotationRemoval = 'Remove'

const DontRemove: AnnotationRemoval = 'DontRemove'

/**
 * Changes the annotation of a document to a different annotation, or
 * none at all.
 *
 * @category utils
 * @since 0.0.1
 */
export const alterAnnotationS = <A, B>(
  f: (a: A) => Option<B>
): ((stream: SimpleDocStream<A>) => SimpleDocStream<B>) => {
  const go = (
    stack: ReadonlyArray<AnnotationRemoval>
  ): ((stream: SimpleDocStream<A>) => SimpleDocStream<B>) =>
    match<A, SimpleDocStream<B>>({
      SFail: () => SFail,
      SEmpty: () => SEmpty,
      SChar: (c, rest) => SChar(c, pipe(rest, go(stack))),
      SText: (t, rest) => SText(t, pipe(rest, go(stack))),
      SLine: (i, rest) => SLine(i, pipe(rest, go(stack))),
      SAnnPush: (a, rest) =>
        pipe(
          f(a),
          O.fold(
            () => pipe(rest, go(RA.cons(Remove, stack))),
            (b) => SAnnPush(b, pipe(rest, go(RA.cons(DontRemove, stack))))
          )
        ),
      SAnnPop: (rest) =>
        pipe(
          stack,
          RA.foldLeft(
            () => absurd<SimpleDocStream<B>>(stack as never),
            (annRemoval, stack_) =>
              annRemoval === DontRemove ? SAnnPop(pipe(rest, go(stack_))) : pipe(rest, go(stack_))
          )
        )
    })
  return go(RA.empty)
}

const prependEmptyLines = (withheldLines: ReadonlyArray<number>) => <A>(
  stream: SimpleDocStream<A>
): SimpleDocStream<A> =>
  pipe(
    withheldLines,
    RA.reduceRight(stream, (_, curr) => SLine(0, curr))
  )

const commitWhitespace = (withheldLines: ReadonlyArray<number>, withheldSpaces: number) => <A>(
  stream: SimpleDocStream<A>
): SimpleDocStream<A> =>
  pipe(
    withheldLines,
    RA.foldLeft(
      () => {
        switch (withheldSpaces) {
          case 0:
            return stream
          case 1:
            return SChar(' ', stream)
          default:
            return SText(M.fold(M.monoidString)(RA.replicate(withheldSpaces, ' ')), stream)
        }
      },
      (i, rest) => pipe(SLine(i + withheldSpaces, stream), prependEmptyLines(rest))
    )
  )

type WhitespaceStrippingState = AnnotationLevel | RecordedWhitespace

interface AnnotationLevel {
  readonly _tag: 'AnnotationLevel'
  readonly level: number
}

interface RecordedWhitespace {
  readonly _tag: 'RecordedWhitespace'
  readonly withheldLines: ReadonlyArray<number>
  readonly withheldSpaces: number
}

const AnnotationLevel = (level: number): WhitespaceStrippingState => ({
  _tag: 'AnnotationLevel',
  level
})

const RecordedWhitespace = (
  withheldLines: ReadonlyArray<number>,
  withheldSpaces: number
): WhitespaceStrippingState => ({
  _tag: 'RecordedWhitespace',
  withheldLines,
  withheldSpaces
})

const endingSpacesRe = / *$/

/**
 * Remove all trailing space characters.
 *
 * This utility has some performance impact as it requires an additional
 * pass over the entire `SimpleDocStream`.
 *
 * No trimming is performed inside annotated documents, which are considered
 * to have no (trimmable) whitespace given that the annotation may relate to
 * the whitespace in the document. For example, a renderer that colors the
 * background of trailing whitespace (e.g., as `git diff` can be configured
 * to do).
 *
 * @category utils
 * @since 0.0.1
 */
export const removeTrailingWhitespace = <A>(stream: SimpleDocStream<A>): SimpleDocStream<A> => {
  const go = (state: WhitespaceStrippingState): Endomorphism<SimpleDocStream<A>> => {
    switch (state._tag) {
      case 'AnnotationLevel':
        // No whitespace is stripped inside annotated documents given that whitespace may be
        // relevant inside an annotated document
        return match<A, SimpleDocStream<A>>({
          SFail: () => SFail,
          SEmpty: () => SEmpty,
          SChar: (c, rest) => SChar(c, pipe(rest, go(state))),
          SText: (t, rest) => SText(t, pipe(rest, go(state))),
          SLine: (i, rest) => SLine(i, pipe(rest, go(state))),
          SAnnPush: (a, rest) => SAnnPush(a, pipe(rest, go(AnnotationLevel(state.level + 1)))),
          SAnnPop: (rest) =>
            state.level > 1
              ? SAnnPop(pipe(rest, go(AnnotationLevel(state.level - 1))))
              : SAnnPop(pipe(rest, go(RecordedWhitespace(RA.empty, 0))))
        })
      case 'RecordedWhitespace':
        // All spaces/lines encountered are recored and once proper text starts again,
        // only the necessary ones are released
        return match<A, SimpleDocStream<A>>({
          SFail: () => SFail,
          SEmpty: () => prependEmptyLines(state.withheldLines)(SEmpty),
          SChar: (c, rest) =>
            c === ' '
              ? pipe(rest, go(RecordedWhitespace(state.withheldLines, state.withheldSpaces + 1)))
              : pipe(
                  SChar(c, pipe(rest, go(RecordedWhitespace(RA.empty, 0)))),
                  commitWhitespace(state.withheldLines, state.withheldSpaces)
                ),
          SText: (t, rest) => {
            const stripped = t.replace(endingSpacesRe, '')
            const strippedLength = stripped.length
            const trailingLength = t.length - strippedLength
            const isOnlySpace = strippedLength === 0
            return isOnlySpace
              ? pipe(
                  rest,
                  go(RecordedWhitespace(state.withheldLines, state.withheldSpaces + t.length))
                )
              : pipe(
                  SText(stripped, pipe(rest, go(RecordedWhitespace(RA.empty, trailingLength)))),
                  commitWhitespace(state.withheldLines, state.withheldSpaces)
                )
          },
          SLine: (i, rest) =>
            pipe(rest, go(RecordedWhitespace(pipe(state.withheldLines, RA.cons(i)), 0))),
          SAnnPush: (a, rest) =>
            pipe(
              SAnnPush(a, pipe(rest, go(AnnotationLevel(1)))),
              commitWhitespace(state.withheldLines, state.withheldSpaces)
            ),
          SAnnPop: () => absurd<SimpleDocStream<A>>(state as never)
        })
      default:
        return constant(absurd(state))
    }
  }
  return pipe(stream, go(RecordedWhitespace(RA.empty, 0)))
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 0.0.1
 */
export const URI = 'prettyprinter-ts/SimpleDocStream'

/**
 * @category instances
 * @since 0.0.1
 */
export type URI = typeof URI

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly [URI]: SimpleDocStream<A>
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
