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

  it 'array', ->
    # TODO: валидировать если это не массива, а строка например
    data = {
      arrayParam: [5, 8]
    }
    assert.isTrue(@typeManager.validateValue(@testSchema, data))

    data = {
      arrayParam: ['d5', 5]
    }
    assert.isFalse(@typeManager.validateValue(@testSchema, data))

  describe 'number', ->
    it "valid: 5, null, undefined, NaN", ->
      # number
      assert.isTrue(@typeManager.validateValue(@testSchema, { numberParam: 5 }))
      # null
      assert.isTrue(@typeManager.validateValue(@testSchema, { numberParam: null }))
      # undefined
      assert.isTrue(@typeManager.validateValue(@testSchema, { numberParam: undefined }))
      # NaN
      assert.isTrue(@typeManager.validateValue(@testSchema, { numberParam: NaN }))

    it "invalid: {}, [], '5a', true", ->
      # {}
      assert.isFalse(@typeManager.validateValue(@testSchema, { numberParam: {} }))
      # []
      assert.isFalse(@typeManager.validateValue(@testSchema, { numberParam: [] }))
      # '5a'
      assert.isFalse(@typeManager.validateValue(@testSchema, { numberParam: '5a' }))
      # TODO: boolean will cat to 1,0
      # true
      assert.isFalse(@typeManager.validateValue(@testSchema, { numberParam: true }))

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
