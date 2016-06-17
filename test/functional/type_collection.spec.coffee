mold = require('../../src/index')

testSchema = () ->
  memoryBranch:
    inMemory:
      arrayParam:
        type: 'collection'
        item: {
          id: {type: 'number'}
          name: {type: 'string'}
        }

describe 'Functional. Collection instance.', ->
  beforeEach () ->
    this.mold = mold.initSchema( {}, testSchema() )
    this.arrayParam = this.mold.instance('memoryBranch.inMemory.arrayParam')
    this.arrayValues = [
      {
        id: 1
        name: 'name1'
      },
      {
        id: 2
        name: 'name2'
      },
    ]

  it 'Set full array', ->
    this.arrayParam.setSilent(this.arrayValues)
    assert.deepEqual(this.arrayParam.mold, this.arrayValues)

#  it 'Add item and get item', ->
#    newItem = {id: 3, name: 'name3'}
#    this.arrayParam.add(newItem)
#    assert.equal(this.arrayParam.getItem(3).mold, newItem)

  it 'Clear a array', ->
    this.arrayParam.setSilent(this.arrayValues)
    this.arrayParam.clear()
    assert.equal(this.arrayParam.mold.length, 0)

  it 'remove', ->
    this.arrayParam.setSilent(this.arrayValues)
    this.arrayParam.remove({id: 1})
    assert.deepEqual(this.arrayParam.mold, _.reject(this.arrayValues, {id:1}))

  it 'Get child', ->
    # TODO: do it


  it 'Many manupulations with array', ->
    newItem = {id: 3, name: 'name3'}
    this.arrayParam.setSilent(this.arrayValues)
    this.arrayParam.add(newItem)
    this.arrayParam.remove({id: 2})
    #this.arrayParam.getItem(1).child('name').set('new name');
    assert.deepEqual(_.compact(this.arrayParam.mold), [
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
