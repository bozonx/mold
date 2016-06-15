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

describe 'Functional. Container instance.', ->
  beforeEach () ->
    this.testSchema = testSchema()
    this.mold = mold.initSchema( {}, this.testSchema )
    this.rootInstance = this.mold.instance('memoryBranch')
    this.container = this.rootInstance.child('inMemory')

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

  it 'get(""): itself values. It returns a promise', () ->
    this.mold.state.setComposition('memoryBranch.inMemory.stringParam', 'new value')
    promise = this.container.get();

    expect(promise).to.eventually.deep.equal({stringParam: 'new value'})
    assert.deepEqual(this.container.mold, {stringParam: 'new value'})
    
  it 'get(subpath): It returns a promise', () ->
    this.mold.state.setComposition('memoryBranch.inMemory.stringParam', 'new value')
    promise = this.container.get('stringParam');

    expect(promise).to.eventually.equal('new value')
    assert.equal(this.container.mold.stringParam, 'new value')

  # TODO: set value
    
  it 'Has a subpath', () ->
    assert.isTrue(this.container.has('nested.nestedStringParam'))
    assert.isFalse(this.container.has('nested.nestedStringParam111'))

#  it 'Set and get child value', () ->
#    this.container.set('stringParam', 'new value')
#    assert.equal(this.container.child('stringParam').mold, 'new value')
#    assert.equal(this.container.mold.stringParam, 'new value')

# TODO: init children


# TODO: set values for all children
