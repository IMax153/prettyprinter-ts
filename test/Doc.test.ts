import * as assert from 'assert'

import * as _ from '../src/Doc'
import * as D from '../src/Internal/Doc'

describe('Doc', () => {
  describe('primitives', () => {
    it('fail', () => {
      assert.deepStrictEqual(_.fail, D.Fail)
    })

    it('empty', () => {
      assert.deepStrictEqual(_.empty, D.Empty)
    })

    it('char', () => {
      assert.deepStrictEqual(_.char('a'), D.Char('a'))
    })

    it('text', () => {
      assert.deepStrictEqual(_.text('foo'), { _tag: 'Text', text: 'foo' })
    })

    it('line', () => {
      assert.deepStrictEqual(_.line, {
        _tag: 'FlatAlt',
        x: D.Line,
        y: D.Char(' ')
      })
    })

    it('line_', () => {
      assert.deepStrictEqual(_.line_, {
        _tag: 'FlatAlt',
        x: D.Line,
        y: D.Empty
      })
    })

    it('softLine', () => {
      assert.deepStrictEqual(_.softLine, {
        _tag: 'Union',
        x: D.Char(' '),
        y: D.Line
      })
    })

    it('softLine_', () => {
      assert.deepStrictEqual(_.softLine_, {
        _tag: 'Union',
        x: D.Empty,
        y: D.Line
      })
    })

    it('hardLine', () => {
      assert.deepStrictEqual(_.hardLine, D.Line)
    })
  })
})
