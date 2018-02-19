TypeManager = require('../../src/TypeManager').default


describe 'Unit. TypeManager.validate.', ->
  beforeEach () ->
    @main = {
    }

    @testSchema = {
      type: 'assoc'
      items: {
        boolParam: {type: 'boolean'}
        stringParam: {type: 'string'}
        numberParam: {type: 'number'}
        arrayParam: {
          type: 'array'
          item: 'number'
        }
        nested: {
          type: 'assoc'
          items: {
            nestedNumberParam: {type: 'number'}
          }
        }
      }
    }

    @moldPath = 'container.state'
    @typeManager = new TypeManager(@main);

  it 'nested', ->
    data = {
      nested: {
        nestedNumberParam: 5
      }
    }
    assert.isTrue(@typeManager.validateValue(@testSchema, data))

    data = {
      nested: {
        nestedNumberParam: 'aa'
      }
    }
    assert.isFalse(@typeManager.validateValue(@testSchema, data))

  describe 'array', ->
    it 'valid', ->
      data = {
        arrayParam: [5, 8]
      }
      assert.isTrue(@typeManager.validateValue(@testSchema, data))
      assert.isTrue(@typeManager.validateValue(@testSchema, { arrayParam: undefined }))
      assert.isTrue(@typeManager.validateValue(@testSchema, { arrayParam: null }))

      # TODO: Может возвращать сообщение?
      # TODO: check inner arrays and assoc

    it 'invalid', ->
      data = {
        arrayParam: true
      }
      assert.isString(@typeManager.validateValue(@testSchema, data))

      data = {
        arrayParam: ['d5', 5]
      }
      assert.isString(@typeManager.validateValue(@testSchema, data))


  describe 'number', ->
    beforeEach () ->
      @schema = {type: 'number'}

    it "valid: 5, null, undefined, NaN", ->
      # number
      assert.isTrue(@typeManager.validateValue(@schema, { numberParam: 5 }))
      # null
      assert.isTrue(@typeManager.validateValue(@schema, { numberParam: null }))
      # undefined
      assert.isTrue(@typeManager.validateValue(@schema, { numberParam: undefined }))
      # NaN
      assert.isTrue(@typeManager.validateValue(@schema, { numberParam: NaN }))

    it.only "invalid: {}, [], '5a', true", ->
      # {}
      assert.isString(@typeManager.validateValue(@schema, {}))
      # []
      assert.isString(@typeManager.validateValue(@schema, []))
      # '5a'
      assert.isString(@typeManager.validateValue(@schema, '5a'))
      # true
      assert.isString(@typeManager.validateValue(@schema, true))

  describe 'string', ->
    # don't check number because it has to be casted
    it "valid: 'str', null, undefined", ->
      # string
      assert.isTrue(@typeManager.validateValue(@testSchema, { stringParam: 'str' }))
      # null
      assert.isTrue(@typeManager.validateValue(@testSchema, { stringParam: null }))
      # undefined
      assert.isTrue(@typeManager.validateValue(@testSchema, { stringParam: undefined }))

    it "invalid: NaN, true, {}, []", ->
      # NaN
      assert.isFalse(@typeManager.validateValue(@testSchema, { stringParam: NaN }))
      # true
      assert.isFalse(@typeManager.validateValue(@testSchema, { stringParam: true }))
      # {}
      assert.isFalse(@typeManager.validateValue(@testSchema, { stringParam: {} }))
      # []
      assert.isFalse(@typeManager.validateValue(@testSchema, { stringParam: [] }))

  describe 'boolean', ->
    # don't check number because it has to be casted
    it "valid: true, false, null, undefined", ->
      # true
      assert.isTrue(@typeManager.validateValue(@testSchema, { boolParam: true }))
      # false
      assert.isTrue(@typeManager.validateValue(@testSchema, { boolParam: false }))
      # null
      assert.isTrue(@typeManager.validateValue(@testSchema, { boolParam: null }))
      # undefined
      assert.isTrue(@typeManager.validateValue(@testSchema, { boolParam: undefined }))

    it "invalid: NaN, string, {}, []", ->
      # NaN
      assert.isFalse(@typeManager.validateValue(@testSchema, { boolParam: NaN }))
      # string
      assert.isFalse(@typeManager.validateValue(@testSchema, { boolParam: 'string' }))
      # {}
      assert.isFalse(@typeManager.validateValue(@testSchema, { boolParam: {} }))
      # []
      assert.isFalse(@typeManager.validateValue(@testSchema, { boolParam: [] }))
