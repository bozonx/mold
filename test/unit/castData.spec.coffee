castData = require('../../src/helpers/castData').default

describe.only 'Unit. castData.', ->
  beforeEach () ->
    @moldPath = 'container.state'
    @schema = {
      state: {
        type: 'state'
        schema: {
          stringParam: { type: 'string' }
          numberParam: { type: 'number' }
          booleanParam: { type: 'boolean' }
          # TODO: array, assoc, nested
        }
      }
    }

  it 'cast string number to number', ->
    data = {
      numberParam: '5'
    }
    cast = new castData(@moldPath, @schema, data, )
    assert.deepEqual(cast, {
      numberParam: 5
    })

  it 'cast string "false" or "true" to boolean', ->
  it 'cast params in array', ->
  it 'cast params in assoc', ->
  it "don't cast undefined, null, NaN", ->
