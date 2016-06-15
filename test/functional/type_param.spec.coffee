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

  it 'After init the all values is undefined', () ->
    assert.isUndefined(this.container.child('boolParam').mold)
    assert.isUndefined(this.container.child('stringParam').mold)
    assert.isUndefined(this.container.child('numberParam').mold)

  it 'Get value. It returns a promise', () ->
    this.mold.state.setComposition('inMemory.stringParam', 'new value')
    stringParam = this.container.child('stringParam')
    promise = stringParam.get();

    expect(promise).to.eventually.equal('new value')
    assert.equal(stringParam.mold, 'new value')

  it 'Set and get boolean value', () ->
    param = this.container.child('boolParam')
    param.set(true);
    assert.equal(param.mold, true)

  it 'Set and get string value', () ->
    param = this.container.child('stringParam')
    param.set('new value');
    assert.equal(param.mold, 'new value')

  it 'Set and get number value', () ->
    param = this.container.child('numberParam')
    param.set(11);
    assert.equal(param.mold, 11)
