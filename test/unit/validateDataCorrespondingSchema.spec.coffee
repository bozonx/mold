validateDataCorrespondingSchema = require('../../src/helpers/validateDataCorrespondingSchema').default

# TODO: add required schema param check
# TODO: возвращать правильное значение

describe 'Unit. validateDataCorrespondingSchema.', ->
  beforeEach () ->
    @moldPath = 'container.state'
    @schemaPath = 'container.schema.state'
    @schema = {
      container: {
        type: 'container'
        schema: {
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
      }
    }

  it 'valid', ->
    data = {
      stringParam: 'string'
      numberParam: 5
      booleanParam: false
    }
    assert.isTrue( validateDataCorrespondingSchema(@moldPath, @schemaPath, @schema, data) )

    data = {
      stringParam: null
      numberParam: null
      booleanParam: null
    }
    assert.isTrue( validateDataCorrespondingSchema(@moldPath, @schemaPath, @schema, data) )

    data = {
      stringParam: undefined
      numberParam: undefined
      booleanParam: undefined
    }
    assert.isTrue( validateDataCorrespondingSchema(@moldPath, @schemaPath, @schema, data) )

  ###### STRING
  it 'invalid string', ->
    # TODO: ???? number или boolean нужно ли превращать в строку
    # TODO: check [] and {}


  ###### NUMBER
  it 'valid number as string', ->
    data = {
      numberParam: 'string'
    }
    msg = ""
    assert.equal( validateDataCorrespondingSchema(@moldPath, @schemaPath, @schema, data), msg )

  it 'invalid number', ->
    data = {
      numberParam: 'string'
    }
    msg = ""
    assert.equal( validateDataCorrespondingSchema(@moldPath, @schemaPath, @schema, data), msg )

    data = {
      numberParam: true
    }
    msg = ""
    assert.equal( validateDataCorrespondingSchema(@moldPath, @schemaPath, @schema, data), msg )

    data = {
      numberParam: []
    }
    msg = ""
    assert.equal( validateDataCorrespondingSchema(@moldPath, @schemaPath, @schema, data), msg )

    data = {
      numberParam: {}
    }
    msg = ""
    assert.equal( validateDataCorrespondingSchema(@moldPath, @schemaPath, @schema, data), msg )

  ###### BOOLEAN

###
