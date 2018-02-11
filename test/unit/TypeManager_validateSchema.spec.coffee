TypeManager = require('../../src/TypeManager').default


describe 'Unit. TypeManager.validateSchema.', ->
  beforeEach () ->
    @main = {}
    @typeManager = new TypeManager(@main);

  describe 'number', ->
    it "valid", ->
      # without params
      assert.isTrue(@typeManager.validateSchema({ type: 'number' }))
      # initial
      assert.isTrue(@typeManager.validateSchema({ type: 'number', initial: 5 }))
      # primary
      assert.isTrue(@typeManager.validateSchema({ type: 'number', primary: true }))

    it "invalid", ->
      # bad param
      assert.isString(@typeManager.validateSchema({ type: 'number', badParam: 'str' }))
      # bad initial
      assert.isString(@typeManager.validateSchema({ type: 'number', initial: true }))
      # bad primary
      assert.isString(@typeManager.validateSchema({ type: 'number', primary: 'str' }))

  describe 'string', ->
    it "valid", ->
      # without params
      assert.isTrue(@typeManager.validateSchema({ type: 'string' }))
      # initial
      assert.isTrue(@typeManager.validateSchema({ type: 'string', initial: 'str' }))

    it "invalid", ->
      # bad param
      assert.isString(@typeManager.validateSchema({ type: 'string', badParam: 5 }))
      # bad initial
      assert.isString(@typeManager.validateSchema({ type: 'string', initial: true }))

  describe 'boolean', ->
    it "valid", ->
      # without params
      assert.isTrue(@typeManager.validateSchema({ type: 'boolean' }))
      # initial
      assert.isTrue(@typeManager.validateSchema({ type: 'boolean', initial: true }))

    it "invalid", ->
      # bad param
      assert.isString(@typeManager.validateSchema({ type: 'boolean', badParam: 5 }))
      # bad initial
      assert.isString(@typeManager.validateSchema({ type: 'boolean', initial: 2 }))


  describe 'array', ->
    it "valid", ->
      # without params
      assert.isTrue(@typeManager.validateSchema({ type: 'array' }))
      # initial
      assert.isTrue(@typeManager.validateSchema({ type: 'array', initial: [ 1, 2, 3 ] }))
      # item
      assert.isTrue(@typeManager.validateSchema({ type: 'array', item: 'number' }))
      # nested schema
      assert.isTrue(@typeManager.validateSchema({ type: 'array', item: { type: 'array' } }))
      # nested schema with initial
      assert.isTrue(@typeManager.validateSchema({
        type: 'array'
        initial: [ [1], [2] ]
        item: { type: 'array', item: 'number' }
      }))

    it "invalid", ->
      # bad param
      assert.isString(@typeManager.validateSchema({ type: 'array', badParam: 5 }))
      # bad initial
      assert.isString(@typeManager.validateSchema({ type: 'array', initial: true }))
      # bad initial
      assert.isString(@typeManager.validateSchema({ type: 'array', item: 'number', initial: [ 1, 'a' ] }))
      # bad item
      assert.isString(@typeManager.validateSchema({ type: 'array', item: 'other' }))
      # nested schema
      assert.isString(@typeManager.validateSchema({ type: 'array', item: { } }))
      # nested schema
      assert.isString(@typeManager.validateSchema({ type: 'array', item: { type: 'number' } }))
      # nested schema with initial
      assert.isString(@typeManager.validateSchema({
        type: 'array'
        initial: [ [1], [2] ]
        item: { type: 'array', item: 'string' }
      }))


  describe 'assoc', ->
    it "valid", ->
      # without params
      assert.isTrue(@typeManager.validateSchema({ type: 'assoc' }))
      # simple items
      assert.isTrue(@typeManager.validateSchema({
        type: 'assoc'
        items: {
          param: { type: 'string', initial: 'str' }
          param: { type: 'number', initial: 5 }
          param: { type: 'boolean', initial: true }
        }
      }))
      # array, assoc, collection
      assert.isTrue(@typeManager.validateSchema({
        type: 'assoc'
        items: {
          param: { type: 'array', item: 'number', initial: [ 1, 2 ] }
          param: { type: 'assoc', items: {
            subParam: { type: 'string', initial: 'str' }
          }}
          # TODO: add collection
          #param: { type: 'collection', initial: true }
        }
      }))

    it "invalid", ->
      # bad param
      assert.isString(@typeManager.validateSchema({ type: 'assoc', badParam: 5 }))
      # simple items
      assert.isString(@typeManager.validateSchema({
        type: 'assoc'
        items: {
          param: { type: 'string', initial: 5 }
        }
      }))
      # array
      assert.isString(@typeManager.validateSchema({
        type: 'assoc'
        items: {
          param: { type: 'array', item: 'number', initial: [ '1', 2 ] }
        }
      }))
      # assoc
      assert.isString(@typeManager.validateSchema({
        type: 'assoc'
        items: {
          param: { type: 'assoc', items: {
            subParam: { type: 'string', initial: 5 }
          }}
        }
      }))
      # TODO: add collection
