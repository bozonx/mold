mold = require('../../src/index')

testSchema = () ->
  inMemory:
    boolParam:
      type: 'boolean'
      default: false
    stringParam:
      type: 'string'
      default: 'defaultStringValue'
    numberParam:
      type: 'number'
      default: 5

describe 'Functional. Param instance.', ->
  beforeEach () ->
    this.mold = mold.initSchema( {}, testSchema() )
    this.container = this.mold.instance('inMemory')

  # TODO: param.get - must returns a promise

  it 'Get initial value, it must returns null', () ->
    assert.isNull(this.container.child('boolParam').mold)
    assert.isNull(this.container.child('stringParam').mold)
    assert.isNull(this.container.child('numberParam').mold)
    # TODO: check get() with promise

  it 'Set and get boolean value', () ->
    param = this.container.child('boolParam')
    param.set(true);
    #assert.equal(param.get(), true)
    assert.equal(param.mold, true)

  it 'Set and get string value', () ->
    param = this.container.child('stringParam')
    param.set('new value');
    #assert.equal(param.get(), 'new value')
    assert.equal(param.mold, 'new value')

  it 'Set and get number value', () ->
    param = this.container.child('numberParam')
    param.set(11);
    #assert.equal(param.get(), 11)
    assert.equal(param.mold, 11)

#  it 'Reset to defaults one value', ->
#    this.container.resetToDefault('stringParam');
#    assert.equal(this.container.get('stringParam'), 'defaultStringValue')
