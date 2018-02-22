TypeManager = require('../../src/TypeManager').default


describe 'Unit. TypeManager.castValue.', ->
  beforeEach () ->
    @main = {}
    @typeManager = new TypeManager(@main);

  describe 'assoc', ->
    beforeEach () ->
      @schema = {
        type: 'assoc'
        items: {
          nestedNumberParam: {type: 'number'}
        }
      }

    it 'correct', ->
      data = { nestedNumberParam: '5' }
      assert.deepEqual( @typeManager.castValue(@schema, data), { nestedNumberParam: 5 } )

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
      assert.deepEqual( @typeManager.castValue(@schema, 5), 5 )
      # undefined
      assert.deepEqual( @typeManager.castValue(@schema, undefined), undefined )
      # null
      assert.deepEqual( @typeManager.castValue(@schema, null), null )
      # and other...

    it 'incorrect - just return its value', ->
      assert.deepEqual( @typeManager.castValue(@schema, 'incorrect'), 'incorrect' )

  describe 'number', ->
    beforeEach () ->
      @schema = { type: 'number' }

    it "Don't cast invalid string value", ->
      assert.deepEqual( @typeManager.castValue(@schema, '5a'), '5a' )
    it 'cast string number to number', ->
      assert.deepEqual( @typeManager.castValue(@schema, '5'), 5 )
    it 'cast boolean to number', ->
      assert.deepEqual( @typeManager.castValue(@schema, true), 1 )
      assert.deepEqual( @typeManager.castValue(@schema, false), 0 )
    it "Don't cast", ->
      # number
      assert.deepEqual( @typeManager.castValue(@schema, 5), 5 )
      # undefined
      assert.deepEqual( @typeManager.castValue(@schema, undefined), undefined )
      # null
      assert.deepEqual( @typeManager.castValue(@schema, null), null )
      # NaN
      assert.deepEqual( @typeManager.castValue(@schema, NaN), NaN )
      # {}
      assert.deepEqual( @typeManager.castValue(@schema, {}), {} )
      # []
      assert.deepEqual( @typeManager.castValue(@schema, []), [] )

  describe 'string', ->
    beforeEach () ->
      @schema = { type: 'string' }

    it "Boolean or NaN cast to undefined", ->
      # boolean
      assert.deepEqual( @typeManager.castValue(@schema, true), undefined )
      # NaN
      assert.deepEqual( @typeManager.castValue(@schema, NaN), undefined )
    it "Number cast to string", ->
      assert.deepEqual( @typeManager.castValue(@schema, 5), '5' )
    it "Don't cast", ->
      # string
      assert.deepEqual( @typeManager.castValue(@schema, 'string'), 'string' )
      # undefined
      assert.deepEqual( @typeManager.castValue(@schema, undefined), undefined )
      # null
      assert.deepEqual( @typeManager.castValue(@schema, null), null )
      # {}
      assert.deepEqual( @typeManager.castValue(@schema, {}), {} )
      # []
      assert.deepEqual( @typeManager.castValue(@schema, []), [] )

  describe 'Boolean', ->
    beforeEach () ->
      @schema = { type: 'boolean' }

    it "Cast 'true' and 'false' to bool", ->
      # "true"
      assert.deepEqual( @typeManager.castValue(@schema, 'true'), true )
      # "false"
      assert.deepEqual( @typeManager.castValue(@schema, 'false'), false )
    it "Cast other types to bool", ->
      # NaN
      assert.deepEqual( @typeManager.castValue(@schema, NaN), false)
      # an empty string
      assert.deepEqual( @typeManager.castValue(@schema, ''), false )
      # string
      assert.deepEqual( @typeManager.castValue(@schema, 'str'), true )
      # 0
      assert.deepEqual( @typeManager.castValue(@schema, 0), false )
      # number
      assert.deepEqual( @typeManager.castValue(@schema, 5), true )
    it "Don't cast", ->
      # boolean
      assert.deepEqual( @typeManager.castValue(@schema, true), true )
      # undefined
      assert.deepEqual( @typeManager.castValue(@schema, undefined), undefined )
      # null
      assert.deepEqual( @typeManager.castValue(@schema, null), null )
      # {}
      assert.deepEqual( @typeManager.castValue(@schema, {}), {} )
      # []
      assert.deepEqual( @typeManager.castValue(@schema, []), [] )
