TypeManager = require('../../src/TypeManager').default


describe 'Unit. TypeManager.castData.', ->
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
        collection: {
          type: 'collection'
          item: {
            numberParam: {type: 'number'}
          }
        }
      }
    }

    @moldPath = 'container.state'
    @typeManager = new TypeManager(@main);

  it 'nested', ->
    data = {
      nested: {
        nestedNumberParam: '5'
      }
    }
    assert.deepEqual @typeManager.castData(@testSchema, data), {
      nested: {
        nestedNumberParam: 5
      }
    }

  it 'array', ->
    data = {
      arrayParam: ['5', '6a', '123']
    }
    assert.deepEqual @typeManager.castData(@testSchema, data), {
      arrayParam: [5, '6a', 123]
    }

  it 'collection', ->
    data = {
      collection: [
        { numberParam: '5' }
      ]
    }
    assert.deepEqual @typeManager.castData(@testSchema, data), {
      collection: [
        { numberParam: 5 }
      ]
    }

  describe 'number', ->
    it "Don't cast", ->
      # number
      data = { numberParam: 5 }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        numberParam: 5
      }
      # undefined
      data = { numberParam: undefined }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        numberParam: undefined
      }
      # null
      data = { numberParam: null }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        numberParam: null
      }
      # NaN
      data = { numberParam: NaN }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        numberParam: NaN
      }
    it "Don't cast invalid value", ->
      data = { numberParam: '5a' }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        numberParam: '5a'
      }
    it 'cast string number to number', ->
      data = { numberParam: '5' }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        numberParam: 5
      }
    it 'cast boolean to number', ->
      data = { numberParam: true }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        numberParam: 1
      }
      data = { numberParam: false }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        numberParam: 0
      }

  describe 'string', ->
    it "Don't cast", ->
      # string
      data = { stringParam: 'string' }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        stringParam: 'string'
      }
      # undefined
      data = { stringParam: undefined }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        stringParam: undefined
      }
      # null
      data = { stringParam: null }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        stringParam: null
      }
    it "Boolean or NaN cast to undefined", ->
      # boolean
      data = { stringParam: true }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        stringParam: undefined
      }
      # NaN
      data = { stringParam: NaN }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        stringParam: undefined
      }
    it "Number cast to string", ->
      data = { stringParam: 5 }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        stringParam: '5'
      }

  describe 'Boolean', ->
    it "Don't cast", ->
      # boolean
      data = { boolParam: true }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        boolParam: true
      }
      # undefined
      data = { boolParam: undefined }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        boolParam: undefined
      }
      # null
      data = { boolParam: null }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        boolParam: null
      }
    it "Cast 'true' and 'false' to bool", ->
      # "true"
      data = { boolParam: 'true' }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        boolParam: true
      }
      # "false"
      data = { boolParam: 'false' }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        boolParam: false
      }
    it "Cast other types to bool", ->
      # NaN
      data = { boolParam: NaN }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        boolParam: false
      }
      # {}
      data = { boolParam: {} }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        boolParam: true
      }
      # []
      data = { boolParam: [] }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        boolParam: true
      }
      # an empty string
      data = { boolParam: '' }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        boolParam: false
      }
      # string
      data = { boolParam: 'str' }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        boolParam: true
      }
      # 0
      data = { boolParam: 0 }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        boolParam: false
      }
      # number
      data = { boolParam: 5 }
      assert.deepEqual @typeManager.castData(@testSchema, data), {
        boolParam: true
      }
