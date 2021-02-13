import * as assert from 'assert'

import * as _ from '../../src/Internal/Doc'
import type { PageWidth } from '../../src/Internal/PageWidth'

describe('Doc', () => {
  describe('constructors', () => {
    it('Fail', () => {
      assert.deepStrictEqual(_.Fail, { _tag: 'Fail' })
    })

    it('Empty', () => {
      assert.deepStrictEqual(_.Empty, { _tag: 'Empty' })
    })

    it('Char', () => {
      assert.deepStrictEqual(_.Char('a'), { _tag: 'Char', char: 'a' })
    })

    it('Text', () => {
      assert.deepStrictEqual(_.Text('foo'), { _tag: 'Text', text: 'foo' })
    })

    it('Line', () => {
      assert.deepStrictEqual(_.Line, { _tag: 'Line' })
    })

    it('FlatAlt', () => {
      assert.deepStrictEqual(_.FlatAlt(_.Char('a'), _.Char('b')), {
        _tag: 'FlatAlt',
        x: _.Char('a'),
        y: _.Char('b')
      })
    })

    it('Cat', () => {
      assert.deepStrictEqual(_.Cat(_.Char('a'), _.Char('b')), {
        _tag: 'Cat',
        x: _.Char('a'),
        y: _.Char('b')
      })
    })

    it('Nest', () => {
      assert.deepStrictEqual(_.Nest(1, _.Char('b')), {
        _tag: 'Nest',
        indent: 1,
        doc: _.Char('b')
      })
    })

    it('Union', () => {
      assert.deepStrictEqual(_.Union(_.Char('a'), _.Char('b')), {
        _tag: 'Union',
        x: _.Char('a'),
        y: _.Char('b')
      })
    })

    it('Column', () => {
      const react = (pos: number): _.Doc<unknown> => _.Text(`${pos}`)

      assert.deepStrictEqual(_.Column(react), {
        _tag: 'Column',
        react
      })
    })

    it('WithPageWidth', () => {
      const react = (pageWidth: PageWidth): _.Doc<unknown> => _.Text(`${pageWidth}`)

      assert.deepStrictEqual(_.WithPageWidth(react), {
        _tag: 'WithPageWidth',
        react
      })
    })

    it('Nesting', () => {
      const react = (level: number): _.Doc<unknown> => _.Text(`${level}`)

      assert.deepStrictEqual(_.Nesting(react), {
        _tag: 'Nesting',
        react
      })
    })

    it('Annotated', () => {
      assert.deepStrictEqual(_.Annotated(1, _.Char('a')), {
        _tag: 'Annotated',
        annotation: 1,
        doc: _.Char('a')
      })
    })
  })

  describe('destructors', () => {
    it('fold', () => {
      const fold = _.fold({
        Fail: () => 'Fail',
        Empty: () => 'Empty',
        Char: () => 'Char',
        Text: () => 'Text',
        Line: () => 'Line',
        FlatAlt: () => 'FlatAlt',
        Cat: () => 'Cat',
        Nest: () => 'Nest',
        Union: () => 'Union',
        Column: () => 'Column',
        WithPageWidth: () => 'WithPageWidth',
        Nesting: () => 'Nesting',
        Annotated: () => 'Annotated'
      })

      assert.deepStrictEqual(fold(_.Fail), 'Fail')
      assert.deepStrictEqual(fold(_.Empty), 'Empty')
      assert.deepStrictEqual(fold(_.Char('a')), 'Char')
      assert.deepStrictEqual(fold(_.Text('foo')), 'Text')
      assert.deepStrictEqual(fold(_.Line), 'Line')
      assert.deepStrictEqual(fold(_.FlatAlt(_.Char('a'), _.Char('b'))), 'FlatAlt')
      assert.deepStrictEqual(fold(_.Cat(_.Char('a'), _.Char('b'))), 'Cat')
      assert.deepStrictEqual(fold(_.Nest(1, _.Char('a'))), 'Nest')
      assert.deepStrictEqual(fold(_.Union(_.Char('a'), _.Char('b'))), 'Union')
      assert.deepStrictEqual(fold(_.Column(() => _.Char('a'))), 'Column')
      assert.deepStrictEqual(fold(_.WithPageWidth(() => _.Char('a'))), 'WithPageWidth')
      assert.deepStrictEqual(fold(_.Nesting(() => _.Char('a'))), 'Nesting')
      assert.deepStrictEqual(fold(_.Annotated(1, _.Char('a'))), 'Annotated')
      assert.throws(() => {
        // @ts-expect-error - valid Doc required
        fold({})
      })
    })
  })
})
