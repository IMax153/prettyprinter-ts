import { pipe } from 'fp-ts/function'

import * as D from './Doc'
import * as L from './Layout'
import * as R from './Render'

const doc = pipe(
  D.vsep([
    D.text('lorem'),
    D.text('ipsum'),
    pipe(D.vsep([D.text('dolor'), D.text('sit')]), D.hang(4))
  ]),
  D.hang(4)
)

console.log(R.render(doc))
// lorem
//     ipsum
//     dolor
//         sit

console.log(pipe(doc, L.layoutCompact, R.renderS))
// lorem
// ipsum
// dolor
// sit
