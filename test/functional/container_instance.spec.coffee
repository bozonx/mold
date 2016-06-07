# TODO: протестирвать если мы взяли инстанст item (memoryBranch.inMemory) и в нем находится list

stateSchema = require('stateSchema')

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
    this.state = stateSchema.initSchema( testSchema() )
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
