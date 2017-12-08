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

  it.only 'incorrect data type', ->
    data = null
    assert.deepEqual( validateDataCorrespondingSchema(@moldPath, @schemaPath, @schema, data), {
      error: 'Incorrect data value "null"'
    } )

    data = 'string'
    assert.deepEqual( validateDataCorrespondingSchema(@moldPath, @schemaPath, @schema, data), {
      error: 'Incorrect data value ""string""'
    } )

    data = 5
    assert.deepEqual( validateDataCorrespondingSchema(@moldPath, @schemaPath, @schema, data), {
      error: 'Incorrect data value "5"'
    } )

    data = true
    assert.deepEqual( validateDataCorrespondingSchema(@moldPath, @schemaPath, @schema, data), {
      error: 'Incorrect data value "true"'
    } )

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


  describe 'string.', ->
    it 'invalid string', ->
      # TODO: ???? number или boolean нужно ли превращать в строку
      # TODO: check [] and {}


  ###### NUMBER
  describe 'number.', ->
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


  describe 'boolean.', ->
    # TODO: ???

  describe 'array.', ->
    # TODO: ???

  describe 'assoc.', ->
    # TODO: ???

  describe 'nested.', ->
    # TODO: ???
