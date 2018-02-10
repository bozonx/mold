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
      # primary
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
