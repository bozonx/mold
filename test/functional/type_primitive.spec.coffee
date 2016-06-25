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

describe 'Functional. Primitive type.', ->
  beforeEach () ->
    this.mold = mold.initSchema( {}, testSchema() )
    this.container = this.mold.instance('inMemory')

  it 'After init all the values is null', () ->
    assert.isNull(this.container.child('boolParam').mold)
    assert.isNull(this.container.child('stringParam').mold)
    assert.isNull(this.container.child('numberParam').mold)

  it 'Set boolean value and check mold', (done) ->
    primitive = this.container.child('boolParam')
    expect(primitive.set(true)).to.eventually.notify =>
      expect(Promise.resolve(primitive.mold)).to.eventually.equal(true).notify(done)

  it 'Set number value and check mold', (done) ->
    primitive = this.container.child('numberParam')
    expect(primitive.set(11)).to.eventually.notify =>
      expect(Promise.resolve(primitive.mold)).to.eventually.equal(11).notify(done)

  it 'Set string value and check mold', (done) ->
    primitive = this.container.child('stringParam')
    expect(primitive.set('new value')).to.eventually.notify =>
      expect(Promise.resolve(primitive.mold)).to.eventually.equal('new value').notify(done)

  it 'Set and get string value', (done) ->
    primitive = this.container.child('stringParam')
    expect(primitive.set('new value')).to.eventually.notify =>
      expect(primitive.get()).to.eventually.property('payload').equal('new value').notify(done)
