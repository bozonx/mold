# TODO: протестирвать если мы взяли инстанст item (memoryBranch.inMemory) и в нем находится list

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

describe 'Functional. Container instance', ->
  beforeEach () ->
    this.state = mold.initSchema( testSchema() )
    this.rootInstance = this.state.instance('memoryBranch')

  it 'Get container and get container instance', () ->
    container = this.rootInstance.get('inMemory')
    containerDeeper = container.get('nested')

  it 'Get container and get param instance', () ->
    container = this.rootInstance.get('inMemory')
    paramInstance = container.get('stringParam')

  it 'Get container and get list instance', () ->
    container = this.rootInstance.get('inMemory')
    listInstance = container.get('listParam')



#  it 'Has value. before and after setting a value', () ->
#    assert.isTrue(this.inMemory.has('stringParam'))
#    this.inMemory.set('stringParam', 'new value')
#    assert.isTrue(this.inMemory.has('stringParam'))

# TODO: set values for all children

# TODO: set and get child value and init
#assert.isNull(this.container.mold.stringParam)

#  it 'Set and get value', () ->
#    this.container.set('stringParam', 'new value')
#    assert.equal(this.container.get('stringParam'), 'new value')
#    assert.equal(this.container.mold.stringParam, 'new value')

#  it 'Reset to defaults all children', ->
#    this.container.resetToDefault();
#    assert.equal(this.container.get('stringParam'), 'defaultStringValue')
#assert.equal(this.container.get('nested.nestedStringParam'), 'defaultNestedStringValue')
