import * as assert from 'assert'

import * as _ from '../src/PageWidth'

describe('PageWidth', () => {
  describe('constructors', () => {
    it('AvailablePerLine', () => {
      assert.deepStrictEqual(_.AvailablePerLine(80, 1), {
        _tag: 'AvailablePerLine',
        lineWidth: 80,
        ribbonFraction: 1
      })
    })

    it('Unbounded', () => {
      assert.deepStrictEqual(_.Unbounded, { _tag: 'Unbounded' })
    })

    it('defaultPageWidth', () => {
      assert.deepStrictEqual(_.defaultPageWidth, {
        _tag: 'AvailablePerLine',
        lineWidth: 80,
        ribbonFraction: 1
      })
    })
  })

  describe('destructors', () => {
    it('fold', () => {
      const fold = _.fold({
        AvailablePerLine: () => 'AvailablePerLine',
        Unbounded: () => 'Unbounded'
      })

      assert.deepStrictEqual(fold(_.AvailablePerLine(80, 1)), 'AvailablePerLine')
      assert.deepStrictEqual(fold(_.Unbounded), 'Unbounded')
      assert.throws(() => {
        // @ts-expect-error - valid PageWidth required
        fold({})
      })
    })
  })
})
