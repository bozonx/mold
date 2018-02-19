TypeManager = require('../../src/TypeManager').default


describe 'Unit. TypeManager.castValue.', ->
  beforeEach () ->
    @main = {
    }

    @testSchema = {
      type: 'assoc'
      items: {
        boolParam: {type: 'boolean'}
        stringParam: {type: 'string'}
        numberParam: {type: 'number'}
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
        nestedNumberParam: '5'
      }
    }
    assert.deepEqual @typeManager.castValue(@testSchema, data), {
      nested: {
        nestedNumberParam: 5
      }
    }

  describe 'array', ->
    beforeEach () ->
      @schema = {
        type: 'array'
        item: 'number'
      }

    it 'correct', ->
      assert.deepEqual( @typeManager.castValue(@schema, ['5', '6a', '123']), [5, '6a', 123] )

      schema = {
        type: 'array'
        item: { type: 'array', item: 'number' }
      }
      assert.deepEqual( @typeManager.castValue(schema, [['5']]), [[5]] )

      schema = {
        type: 'array'
        item: {
          type: 'assoc'
          items: {
            id: { type: 'number' }
          }
        }
      }
      assert.deepEqual( @typeManager.castValue(schema, [{id: '5'}]), [{id: 5}] )

    it "Don't cast", ->
      # number
      assert.deepEqual( @typeManager.castValue(@testSchema, 5), 5 )
      # undefined
      assert.deepEqual( @typeManager.castValue(@testSchema, undefined), undefined )
      # null
      assert.deepEqual( @typeManager.castValue(@testSchema, null), null )
      # and other...

    it 'incorrect - just return its value', ->
      assert.deepEqual @typeManager.castValue(@schema, 'incorrect'), 'incorrect'

  describe 'number', ->
    it "Don't cast", ->
      # number
      data = { numberParam: 5 }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        numberParam: 5
      }
      # undefined
      data = { numberParam: undefined }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        numberParam: undefined
      }
      # null
      data = { numberParam: null }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        numberParam: null
      }
      # NaN
      data = { numberParam: NaN }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        numberParam: NaN
      }
      # {}
      data = { numberParam: {} }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        numberParam: {}
      }
      # []
      data = { numberParam: [] }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        numberParam: []
      }
    it "Don't cast invalid string value", ->
      data = { numberParam: '5a' }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        numberParam: '5a'
      }
    it 'cast string number to number', ->
      data = { numberParam: '5' }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        numberParam: 5
      }
    it 'cast boolean to number', ->
      data = { numberParam: true }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        numberParam: 1
      }
      data = { numberParam: false }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        numberParam: 0
      }

  describe 'string', ->
    it "Don't cast", ->
      # string
      data = { stringParam: 'string' }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        stringParam: 'string'
      }
      # undefined
      data = { stringParam: undefined }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        stringParam: undefined
      }
      # null
      data = { stringParam: null }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        stringParam: null
      }
      # {}
      data = { stringParam: {} }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        stringParam: {}
      }
      # []
      data = { stringParam: [] }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        stringParam: []
      }
    it "Boolean or NaN cast to undefined", ->
      # boolean
      data = { stringParam: true }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        stringParam: undefined
      }
      # NaN
      data = { stringParam: NaN }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        stringParam: undefined
      }
    it "Number cast to string", ->
      data = { stringParam: 5 }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        stringParam: '5'
      }

  describe 'Boolean', ->
    it "Don't cast", ->
      # boolean
      data = { boolParam: true }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        boolParam: true
      }
      # undefined
      data = { boolParam: undefined }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        boolParam: undefined
      }
      # null
      data = { boolParam: null }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        boolParam: null
      }
      # {}
      data = { boolParam: {} }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        boolParam: {}
      }
      # []
      data = { boolParam: [] }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        boolParam: []
      }
    it "Cast 'true' and 'false' to bool", ->
      # "true"
      data = { boolParam: 'true' }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        boolParam: true
      }
      # "false"
      data = { boolParam: 'false' }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        boolParam: false
      }
    it "Cast other types to bool", ->
      # NaN
      data = { boolParam: NaN }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        boolParam: false
      }
      # an empty string
      data = { boolParam: '' }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        boolParam: false
      }
      # string
      data = { boolParam: 'str' }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        boolParam: true
      }
      # 0
      data = { boolParam: 0 }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        boolParam: false
      }
      # number
      data = { boolParam: 5 }
      assert.deepEqual @typeManager.castValue(@testSchema, data), {
        boolParam: true
      }
