mold = require('../../src/index')

testSchema = () ->
  memoryBranch:
    inMemory:
      listParam:
        type: 'list'
        item: {
          id: {type: 'number'}
          name: {type: 'string'}
        }

describe 'Functional. List instance.', ->
  beforeEach () ->
    this.state = mold.initSchema( testSchema() )
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

  it 'Set full list', ->
    this.listParam.setSilent(this.list)
    assert.deepEqual(this.listParam.mold, this.list)

  it 'Add item and get item', ->
    newItem = {id: 3, name: 'name3'}
    this.listParam.add(newItem)
    assert.equal(this.listParam.getItem(3).mold, newItem)

  it 'Clear a list', ->
    this.listParam.setSilent(this.list)
    this.listParam.clear()
    assert.equal(this.listParam.mold.length, 0)

  it 'remove', ->
    this.listParam.setSilent(this.list)
    this.listParam.remove({id: 1})
    assert.deepEqual(this.listParam.mold, _.reject(this.list, {id:1}))

  it 'Get child', ->
    # TODO: do it


  it 'Many manupulations with list', ->
    newItem = {id: 3, name: 'name3'}
    this.listParam.setSilent(this.list)
    this.listParam.add(newItem)
    this.listParam.remove({id: 2})
    #this.listParam.getItem(1).child('name').set('new name');
    assert.deepEqual(_.compact(this.listParam.mold), [
      {
        id: 1
        name: 'name1'
        #name: 'new name'
      }
      {
        id: 3
        name: 'name3'
      }
    ])
