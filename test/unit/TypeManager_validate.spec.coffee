TypeManager = require('../../src/TypeManager')


describe 'Unit. TypeManager.validate.', ->
  beforeEach () ->
    @main = {}
    @typeManager = new TypeManager(@main);

  describe 'assoc', ->
    beforeEach () ->
      @schema = {
        type: 'assoc'
        items: {
          param: { type: 'number' }
        }
      }

    it 'valid', ->
      assert.isUndefined(@typeManager.validateValue(@schema, { param: 5 }))

    it 'invalid', ->
      # []
      assert.isString(@typeManager.validateValue(@schema, []))
      # string
      assert.isString(@typeManager.validateValue(@schema, 'str'))
      # number
      assert.isString(@typeManager.validateValue(@schema, 5))
      # true
      assert.isString(@typeManager.validateValue(@schema, true))
      # invalid
      assert.isString(@typeManager.validateValue(@schema, { param: 'str' }))


  describe 'array', ->
    beforeEach () ->
      @schema = {
        type: 'array'
        item: 'number'
      }

    it 'valid', ->
      assert.isUndefined(@typeManager.validateValue(@schema, [5, 8]))
      assert.isUndefined(@typeManager.validateValue(@schema, undefined))
      assert.isUndefined(@typeManager.validateValue(@schema, null))

      schema = {
        type: 'array'
        item: {
          type: 'array'
          item: 'number'
        }
      }
      assert.isUndefined(@typeManager.validateValue(schema, [ [5], [8] ]))

      schema = {
        type: 'array'
        item: {
          type: 'assoc'
          items: {
            param: { type: 'number' }
          }
        }
      }
      assert.isUndefined(@typeManager.validateValue(schema, [ { param: 5 } ]))

    it 'invalid', ->
      # {}
      assert.isString(@typeManager.validateValue(@schema, {}))
      # string
      assert.isString(@typeManager.validateValue(@schema, 'str'))
      # number
      assert.isString(@typeManager.validateValue(@schema, 5))
      # true
      assert.isString(@typeManager.validateValue(@schema, true))
      # invalid
      assert.isString(@typeManager.validateValue(@schema, ['d5', 5]))

      schema = {
        type: 'array'
        item: {
          type: 'array'
          item: 'number'
        }
      }
      assert.isString(@typeManager.validateValue(schema, [ [5], ['8'] ]))

      schema = {
        type: 'array'
        item: {
          type: 'assoc'
          items: {
            param: { type: 'number' }
          }
        }
      }
      assert.isString(@typeManager.validateValue(schema, [ { param: '5' } ]))

  describe 'number', ->
    beforeEach () ->
      @schema = { type: 'number' }

    it "valid: 5, null, undefined, NaN", ->
      # number
      assert.isUndefined(@typeManager.validateValue(@schema, 5))
      # null
      assert.isUndefined(@typeManager.validateValue(@schema, null))
      # undefined
      assert.isUndefined(@typeManager.validateValue(@schema, undefined))
      # NaN
      assert.isUndefined(@typeManager.validateValue(@schema, NaN))

    it "invalid: {}, [], '5a', true", ->
      # {}
      assert.isString(@typeManager.validateValue(@schema, {}))
      # []
      assert.isString(@typeManager.validateValue(@schema, []))
      # '5a'
      assert.isString(@typeManager.validateValue(@schema, '5a'))
      # true
      assert.isString(@typeManager.validateValue(@schema, true))

  describe 'string', ->
    beforeEach () ->
      @schema = { type: 'string' }

    # don't check number because it has to be casted
    it "valid: 'str', null, undefined", ->
      # string
      assert.isUndefined(@typeManager.validateValue(@schema, 'str'))
      # null
      assert.isUndefined(@typeManager.validateValue(@schema, null))
      # undefined
      assert.isUndefined(@typeManager.validateValue(@schema, undefined))

    it "invalid: NaN, true, {}, []", ->
      # NaN
      assert.isString(@typeManager.validateValue(@schema, NaN))
      # true
      assert.isString(@typeManager.validateValue(@schema, true))
      # {}
      assert.isString(@typeManager.validateValue(@schema, {}))
      # []
      assert.isString(@typeManager.validateValue(@schema, []))

  describe 'boolean', ->
    beforeEach () ->
      @schema = { type: 'boolean' }

    # don't check number because it has to be casted
    it "valid: true, false, null, undefined", ->
      # true
      assert.isUndefined(@typeManager.validateValue(@schema, true))
      # false
      assert.isUndefined(@typeManager.validateValue(@schema, false))
      # null
      assert.isUndefined(@typeManager.validateValue(@schema, null))
      # undefined
      assert.isUndefined(@typeManager.validateValue(@schema, undefined))

    it "invalid: NaN, string, {}, []", ->
      # NaN
      assert.isString(@typeManager.validateValue(@schema, NaN))
      # string
      assert.isString(@typeManager.validateValue(@schema, 'str'))
      # {}
      assert.isString(@typeManager.validateValue(@schema, {}))
      # []
      assert.isString(@typeManager.validateValue(@schema, []))
