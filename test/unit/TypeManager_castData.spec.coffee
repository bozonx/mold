TypeManager = require('../../src/TypeManager').default


describe.only 'Functional. castData.', ->
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
            nestedStringParam: {type: 'string'}
          }
        }
      }
    }

    @moldPath = 'container.state'
    @typeManager = new TypeManager(@main);

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


  it 'cast string "false" or "true" to boolean', ->
  it 'cast params in array', ->
  it 'cast params in assoc', ->
  it "don't cast undefined, null, NaN", ->
