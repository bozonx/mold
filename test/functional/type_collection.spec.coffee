mold = require('../../src/index')

testSchema = () ->
  inMemory:
    collectionParam:
      type: 'collection'
      item: {
        id: {type: 'number', primary: true}
        name: {type: 'string'}
      }

testValues = [
  {
    id: 1
    name: 'name1'
  },
  {
    id: 2
    name: 'name2'
  },
]

describe 'Functional. Collection instance.', ->
  beforeEach () ->
    this.mold = mold.initSchema( {}, testSchema() )
    this.container = this.mold.instance('inMemory')
    this.collectionParam = this.mold.instance('inMemory.collectionParam')

  it 'child()', ->
    # TODO: do it

  it 'filter()', ->
    # TODO: do it

  it 'page()', ->
    # TODO: do it

  it 'find()', ->
    # TODO: do it

  it 'add()', () ->
    newItem = {id: 3, name: 'name3'}
    this.collectionParam.add(newItem)
    assert.equal(this.collectionParam.mold[0], newItem)

  it 'remove()', ->
    this.collectionParam.add(testValues[0])
    this.collectionParam.add(testValues[1])
    this.collectionParam.remove(testValues[0])
    assert.deepEqual(this.collectionParam.mold, [testValues[1]])

  it 'has()', ->
    # TODO: do it

  it 'clear()', ->
    # TODO: do it



#  it 'Clear a array', ->
#    this.arrayParam.setSilent(this.arrayValues)
#    this.arrayParam.clear()
#    assert.equal(this.arrayParam.mold.length, 0)
#
#  it 'remove', ->
#    this.arrayParam.setSilent(this.arrayValues)
#    this.arrayParam.remove({id: 1})
#    assert.deepEqual(this.arrayParam.mold, _.reject(this.arrayValues, {id:1}))
#
#  it 'Get child', ->
#    # TODO: do it
#
#
#  it 'Many manupulations with array', ->
#    newItem = {id: 3, name: 'name3'}
#    this.arrayParam.setSilent(this.arrayValues)
#    this.arrayParam.add(newItem)
#    this.arrayParam.remove({id: 2})
#    #this.arrayParam.getItem(1).child('name').set('new name');
#    assert.deepEqual(_.compact(this.arrayParam.mold), [
#      {
#        id: 1
#        name: 'name1'
#        #name: 'new name'
#      }
#      {
#        id: 3
#        name: 'name3'
#      }
#    ])
