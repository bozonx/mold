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
#    it "Don't cast", ->
#      # number
#      data = { numberParam: 5 }
#      assert.deepEqual @typeManager.castData(@testSchema, data), {
#        numberParam: 5
#      }
