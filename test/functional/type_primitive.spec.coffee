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

  it 'After init all the values is undefined', () ->
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
    primitive = this.container.child('boolParam')
    primitive.set(true);
    assert.equal(primitive.mold, true)

  it 'Set and get string value', () ->
    primitive = this.container.child('stringParam')
    promise = primitive.set('new value');
    assert.equal(primitive.mold, 'new value')
    expect(promise).to.eventually.equal('new value')

  it 'Set and get number value', () ->
    primitive = this.container.child('numberParam')
    primitive.set(11);
    assert.equal(primitive.mold, 11)