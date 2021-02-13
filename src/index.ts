import { pipe } from 'fp-ts/function'
import * as M from 'fp-ts/Monoid'
import * as RA from 'fp-ts/ReadonlyArray'

import * as D from './Doc'
import * as L from './Layout'
import * as R from './Render'

const line = pipe(RA.replicate(26 - 2, '-'), M.fold(M.monoidString))
const hr = M.fold(D.getMonoid<void>())([D.char('|'), D.text(line), D.char('|')])

console.log(R.renderS(pipe(L.defaultLayoutOptions, L.layoutSmart(hr))))
