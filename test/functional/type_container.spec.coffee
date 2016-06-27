mold = require('../../src/index')

testSchema = () ->
  memoryBranch:
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
      arrayParam:
        type: 'array'
        item: {
          id: {type: 'number'}
          name: {type: 'string'}
        }
      nested:
        nestedStringParam:
          type: 'string'
          default: 'defaultNestedStringValue'

describe 'Functional. Container type.', ->
  beforeEach () ->
    this.testSchema = testSchema()
    this.mold = mold.initSchema( {}, this.testSchema )
    rootInstance = this.mold.instance('memoryBranch')
    this.container = rootInstance.child('inMemory')

  it 'child: container', () ->
    containerDeeper = this.container.child('nested')
    assert.equal(containerDeeper.getRoot(), 'memoryBranch.inMemory.nested')
    assert.deepEqual(containerDeeper.schema, this.testSchema.memoryBranch.inMemory.nested)

  it 'child: primitive', () ->
    primitiveInstance = this.container.child('stringParam')
    assert.equal(primitiveInstance.getRoot(), 'memoryBranch.inMemory.stringParam')
    assert.deepEqual(primitiveInstance.schema, this.testSchema.memoryBranch.inMemory.stringParam)

  it 'child: array', () ->
    arrayInstance = this.container.child('arrayParam')
    assert.equal(arrayInstance.getRoot(), 'memoryBranch.inMemory.arrayParam')
    assert.deepEqual(arrayInstance.schema, this.testSchema.memoryBranch.inMemory.arrayParam)

  it 'Set to child and check child mold', (done) ->
    expect(this.container.set('stringParam', 'new value')).to.eventually.notify =>
      expect(Promise.resolve(this.container.child('stringParam').mold)).to.eventually.equal('new value').notify(done)

  it 'set({...}) and get("")', (done) ->
    expect(this.container.set({stringParam: 'new value'})).to.eventually.notify =>
      expect(this.container.get('')).to.eventually.property('coocked').deep.equal({stringParam: 'new value'}).notify(done)

  it 'get(subpath)', (done) ->
    expect(this.container.set('stringParam', 'new value')).to.eventually.notify =>
      expect(this.container.get('stringParam')).to.eventually.property('coocked').equal('new value').notify(done)

  it 'set(subpath, newValue): Set to primitive via container', (done) ->
    expect(this.container.set('stringParam', 'new value')).to.eventually.notify =>
      expect(Promise.resolve(this.container.mold.stringParam)).to.eventually.equal('new value').notify(done)
