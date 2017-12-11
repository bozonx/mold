TypeManager = require('../../src/TypeManager').default


# TODO: check collections

describe.only 'Unit. TypeManager.validate.', ->
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
      #assert.isFalse(@typeManager.validateData(@testSchema, { numberParam: [] }))
      # '5a'
      #assert.isFalse(@typeManager.validateData(@testSchema, { numberParam: '5a' }))
      # true
      #assert.isFalse(@typeManager.validateData(@testSchema, { numberParam: true }))
