TypeManager = require('../../src/TypeManager').default


describe 'Unit. TypeManager.validateSchema.', ->
  beforeEach () ->
    @main = {}
    @typeManager = new TypeManager(@main);

  describe 'number', ->

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
