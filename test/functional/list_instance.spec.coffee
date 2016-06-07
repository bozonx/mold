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

  it 'Clear a list', ->
    this.listParam.set(this.list)
    this.listParam.clear()
    assert.equal(this.listParam.get().length, 0)

  it 'remove', ->
    this.listParam.set(this.list)
    this.listParam.remove({id: 1})
    assert.deepEqual(this.listParam.get(), _.reject(this.list, {id:1}))

  it 'Many manupulations with list', ->
    newItem = {id: 3, name: 'name3'}
    this.listParam.set(this.list)
    this.listParam.add(newItem)
    this.listParam.remove({id: 2})
    # TODO: add change item and to default
    assert.deepEqual(this.listParam.get(), [
      {
        id: 1
        name: 'name1'
      }
      {
        id: 3
        name: 'name3'
      }
    ])
