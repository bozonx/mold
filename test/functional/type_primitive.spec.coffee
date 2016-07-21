mold = require('../../src/index')

testSchema = () ->
  inMemory:
    boolParam:
      type: 'boolean'
    stringParam:
      type: 'string'
    numberParam:
      type: 'number'

describe 'Functional. Primitive type.', ->
  beforeEach () ->
    this.mold = mold.initSchema( {}, testSchema() )
    this.container = this.mold.instance('inMemory')

  it 'After init all the values is null', () ->
    assert.isNull(this.container.child('boolParam').mold)
    assert.isNull(this.container.child('stringParam').mold)
    assert.isNull(this.container.child('numberParam').mold)

  it 'get() and check response', ->
    _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.stringParam', 'new value')
    primitive = this.container.child('stringParam')
    expect(primitive.get()).to.eventually.property('coocked').equal('new value')

  it 'get() and check mold', (done) ->
    _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.stringParam', 'new value')
    primitive = this.container.child('stringParam')
    expect(primitive.get()).to.eventually.notify =>
      expect(Promise.resolve(primitive.mold)).to.eventually
      .equal('new value')
      .notify(done)
    
  it 'set via conatiner', ->
    this.container.setMold('stringParam', 'new value')

    assert.equal(this.container.child('stringParam').mold, 'new value')

  it 'set string, boolean, number', ->
    this.container.child('boolParam').setMold(true)
    this.container.child('stringParam').setMold('new value')
    this.container.child('numberParam').setMold(5)

    assert.equal(this.container.child('boolParam').mold, true)
    assert.equal(this.container.child('stringParam').mold, 'new value')
    assert.equal(this.container.child('numberParam').mold, 5)

  it 'setMold and save', ->
    primitive = this.container.child('stringParam')
    primitive.setMold('new value')

    assert.equal(primitive.mold, 'new value')
    expect(primitive.save()).to.eventually
    .property('coocked').deep.equal('new value')
