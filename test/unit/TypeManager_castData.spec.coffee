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

  it 'cast string number to number', ->
    data = {
      numberParam: '5'
    }
    assert.deepEqual(@typeManager.castData(@testSchema, data), {
      numberParam: 5
    })

  it 'cast string "false" or "true" to boolean', ->
  it 'cast params in array', ->
  it 'cast params in assoc', ->
  it "don't cast undefined, null, NaN", ->
