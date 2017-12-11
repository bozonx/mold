TypeManager = require('../../src/TypeManager').default


# TODO: check collections

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
          itemsType: 'number'
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
    assert.isTrue(@typeManager.validateData(@testSchema, data))

    data = {
      nested: {
        nestedNumberParam: 'aa'
      }
    }
    assert.isFalse(@typeManager.validateData(@testSchema, data))

  it 'array', ->
    data = {
      arrayParam: [5, 8]
    }
    assert.isTrue(@typeManager.validateData(@testSchema, data))

    data = {
      arrayParam: ['d5', 5]
    }
    assert.isFalse(@typeManager.validateData(@testSchema, data))


  describe 'number', ->
    it "valid: 5, null, undefined, NaN", ->
      # number
      assert.isTrue(@typeManager.validateData(@testSchema, { numberParam: 5 }))
      # null
      assert.isTrue(@typeManager.validateData(@testSchema, { numberParam: null }))
      # undefined
      assert.isTrue(@typeManager.validateData(@testSchema, { numberParam: undefined }))
      # NaN
      assert.isTrue(@typeManager.validateData(@testSchema, { numberParam: NaN }))

    it "invalid: {}, [], '5a', true", ->
      # {}
      assert.isFalse(@typeManager.validateData(@testSchema, { numberParam: {} }))
      # []
      assert.isFalse(@typeManager.validateData(@testSchema, { numberParam: [] }))
      # '5a'
      assert.isFalse(@typeManager.validateData(@testSchema, { numberParam: '5a' }))
      # true
      assert.isFalse(@typeManager.validateData(@testSchema, { numberParam: true }))

  describe 'string', ->
    # don't check number because it has to be casted
    it "valid: 'str', null, undefined", ->
      # string
      assert.isTrue(@typeManager.validateData(@testSchema, { stringParam: 'str' }))
      # null
      assert.isTrue(@typeManager.validateData(@testSchema, { stringParam: null }))
      # undefined
      assert.isTrue(@typeManager.validateData(@testSchema, { stringParam: undefined }))

    it "invalid: NaN, true, {}, []", ->
      # NaN
      assert.isFalse(@typeManager.validateData(@testSchema, { stringParam: NaN }))
      # true
      assert.isFalse(@typeManager.validateData(@testSchema, { stringParam: true }))
      # {}
      assert.isFalse(@typeManager.validateData(@testSchema, { stringParam: {} }))
      # []
      assert.isFalse(@typeManager.validateData(@testSchema, { stringParam: [] }))

  describe 'boolean', ->
    # don't check number because it has to be casted
    it "valid: true, false, null, undefined", ->
      # true
      assert.isTrue(@typeManager.validateData(@testSchema, { boolParam: true }))
      # false
      assert.isTrue(@typeManager.validateData(@testSchema, { boolParam: false }))
      # null
      assert.isTrue(@typeManager.validateData(@testSchema, { boolParam: null }))
      # undefined
      assert.isTrue(@typeManager.validateData(@testSchema, { boolParam: undefined }))

    it "invalid: NaN, string, {}, []", ->
      # NaN
      assert.isFalse(@typeManager.validateData(@testSchema, { boolParam: NaN }))
      # string
      assert.isFalse(@typeManager.validateData(@testSchema, { boolParam: 'string' }))
      # {}
      assert.isFalse(@typeManager.validateData(@testSchema, { boolParam: {} }))
      # []
      assert.isFalse(@typeManager.validateData(@testSchema, { boolParam: [] }))
