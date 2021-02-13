/**
 * @since 0.0.1
 */
import { absurd, pipe } from 'fp-ts/function'
import * as M from 'fp-ts/Monoid'
import * as RA from 'fp-ts/ReadonlyArray'

import type { SimpleDocStream } from './SimpleDocStream'
import * as SDS from './SimpleDocStream'

// -------------------------------------------------------------------------------------
// rendering algorithms
// -------------------------------------------------------------------------------------

const foldS = M.fold(M.monoidString)

/**
 * @category rendering algorithms
 * @since 0.0.1
 */
export const renderS: <A>(stream: SimpleDocStream<A>) => string = SDS.fold({
  SFail: () => absurd<string>(M.monoidString.empty as never),
  SEmpty: () => M.monoidString.empty,
  SChar: (c, x) => foldS([c, renderS(x)]),
  SText: (t, x) => foldS([t, renderS(x)]),
  SLine: (i, x) => foldS([foldS(pipe(RA.replicate(i, ' '), RA.cons('\n'))), renderS(x)]),
  SAnnPush: (_, x) => renderS(x),
  SAnnPop: (x) => renderS(x)
})
