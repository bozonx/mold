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
    this.list = [
      {
        id: 1
        name: 'name1'
      },
      {
        id: 2
        name: 'name2'
      },
    ]

  it 'Set and get all list', ->
    this.listParam.set(this.list)
    assert.deepEqual(this.listParam.get(), this.list)

  it 'Add item and get item', ->
    newItem = {id: 3, name: 'name3'}
    this.listParam.add(newItem)
    assert.equal(this.listParam.getItem({id: 3}), newItem)
    
    
    
  it 'Many manupulations with list', ->
    newItem = {id: 3, name: 'name3'}
    this.listParam.set(this.list)
    this.listParam.add(newItem)
    # TODO: сделать много разных манипуляций и получить в конце ожидаемый результат - set, add, delete, change, to default and getItem and get()
    

# TODO: протестирвать если мы взяли инстанст item (memoryBranch.inMemory) и в нем находится list
