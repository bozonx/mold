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

  it 'get(""): itself values', () ->
    # TODO: надо в momory установить значение, и потом его получить
#    this.mold.state.setComposition('memoryBranch.inMemory.stringParam', 'new value')
#    result = {
#      boolParam: null
#      stringParam: 'new value'
#      numberParam: null
#      arrayParam: []
#    }
#
#    expect(this.container.get()).to.eventually
#    .deep.equal(result).notify =>
#      expect(Promise.resolve(this.container.mold)).to.eventually.deep.equal(result).notify(done)

#  it 'get(subpath)', () ->
#    
#  
#  
#    this.mold.state.setComposition('memoryBranch.inMemory.stringParam', 'new value')
#    promise = this.container.get('stringParam');
#
#    expect(promise).to.eventually.equal('new value')
#    assert.equal(this.container.mold.stringParam, 'new value')

  it 'set(): Set for the all children', () ->
    # TODO: надо в momory установить значение, и потом его получить
#    promise = this.container.set('', {stringParam: 'new value'})
#
#    expect(promise).to.be.fulfilled
#    assert.deepEqual(this.container.mold, {stringParam: 'new value'})
#    assert.equal(this.container.mold.stringParam, 'new value')
#    assert.equal(this.container.child('stringParam').mold, 'new value')
#    assert.equal(this.container.mold.stringParam, 'new value')

  it 'set(subpath, newValue): Set child value', (done) ->
    expect(this.container.set('stringParam', 'new value')).to.eventually.notify =>
      expect(Promise.resolve(this.container.mold.stringParam)).to.eventually.equal('new value').notify(done)
  
# TODO: write test for child
#    assert.equal(this.container.child('stringParam').mold, 'new value')

