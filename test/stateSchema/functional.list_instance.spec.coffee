stateSchema = require('stateSchema')

testSchema = () ->
  memoryBranch:
    inMemory:
      listParam:
        type: 'list'
        item: {
          id: {type: 'number'}
          name: {type: 'string'}
        }

describe 'Functional. List instance', ->
  beforeEach () ->
    this.state = stateSchema.initSchema( testSchema() )
    this.listParam = this.state.instance('memoryBranch.inMemory.listParam')

  it 'Set and get all list', ->
    list = [
      {
        id: 1
        name: 'name1'
      },
      {
        id: 2
        name: 'name2'
      },
    ]

    this.listParam.setAll(list)
    assert.deepEqual(this.listParam.getList(), list)

  it 'Add item', ->

# TODO: протестирвать если мы взяли инстанст item (memoryBranch.inMemory) и в нем находится list
