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
      listParam:
        type: 'list'
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
    this.state = mold.initSchema( this.testSchema )
    this.rootInstance = this.state.instance('memoryBranch')
    this.container = this.rootInstance.child('inMemory')

  it 'Get container and get container instance', () ->
    containerDeeper = this.container.child('nested')
    # TODO: что должно быть в mold????
    #assert.deepEqual(containerDeeper.mold, this.testSchema.memoryBranch.inMemory.nested)
    assert.equal(containerDeeper.getRoot(), 'memoryBranch.inMemory.nested')
    assert.deepEqual(containerDeeper.schema, this.testSchema.memoryBranch.inMemory.nested)

  it 'Get container and get param instance', () ->
    paramInstance = this.container.child('stringParam')
    assert.equal(paramInstance.getRoot(), 'memoryBranch.inMemory.stringParam')
    assert.deepEqual(paramInstance.schema, this.testSchema.memoryBranch.inMemory.stringParam)

  it 'Get container and get list instance', () ->
    listInstance = this.container.child('listParam')
    assert.equal(listInstance.getRoot(), 'memoryBranch.inMemory.listParam')
    assert.deepEqual(listInstance.schema, this.testSchema.memoryBranch.inMemory.listParam)

  it 'Has a subpath', () ->
    assert.isTrue(this.container.has('nested.nestedStringParam'))
    assert.isFalse(this.container.has('nested.nestedStringParam111'))

#  it 'Set and get child value', () ->
#    this.container.set('stringParam', 'new value')
#    assert.equal(this.container.child('stringParam').mold, 'new value')
#    assert.equal(this.container.mold.stringParam, 'new value')

# TODO: init children


# TODO: set values for all children


# TODO: reset to defaults
#  it 'Reset to defaults all children', ->
#    this.container.resetToDefault();
#    assert.equal(this.container.get('stringParam'), 'defaultStringValue')
#assert.equal(this.container.get('nested.nestedStringParam'), 'defaultNestedStringValue')
