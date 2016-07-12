mold = require('../../src/index')
Memory = require('../../src/drivers/Memory').default

testSchema = (memory) ->
  inMemory: memory({}, {
    collectionParam: document: {}, schema: {
      type: 'collection'
      item: {
        id: {type: 'number', primary: true}
        name: {type: 'string'}
      }
    }
  })
#  inMemory: memory({}, {
#    collectionParam:
#      type: 'collection'
#      item: {
#        id: {type: 'number', primary: true}
#        name: {type: 'string'}
#      }
#  })

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

describe 'Functional. Collection type.', ->
  beforeEach () ->
    this.memoryDb = {};
    memory = new Memory({db: this.memoryDb});
    this.mold = mold.initSchema( {}, testSchema(memory.schema) )
    this.container = this.mold.instance('inMemory')
    this.collectionParam = this.mold.instance('inMemory.collectionParam')

#  it 'init via container', ->
#    this.container.setSilent('collectionParam', testValues)
#    assert.deepEqual(this.container.mold.collectionParam, testValues)
#    assert.deepEqual(this.collectionParam.mold, testValues)

#  it 'child()', (done) ->
#    expect(this.collectionParam.add(testValues[0])).notify =>
#      expect(this.collectionParam.add(testValues[1])).notify =>
#        assert.equal(this.collectionParam.child(2).mold.name, 'name2')
#        done()

  it 'get()', () ->
    this.memoryDb.inMemory = {collectionParam: testValues[0]}

    expect(this.collectionParam.get()).to.eventually
    .property('coocked').deep.equal(testValues[0])


#  it 'add()', ->
#    promise = this.collectionParam.add({id: 3, name: 'name3'})
#    expect(promise).to.eventually.property('payload').deep.equal({id: 3, name: 'name3', $index: 0})
#
#  it 'remove()', (done) ->
#    expect(this.collectionParam.add(testValues[0])).to.eventually.notify =>
#      expect(this.collectionParam.add(testValues[1])).to.eventually.notify =>
#        expect(this.collectionParam.remove(testValues[0])).to.eventually.notify =>
#          expect(Promise.resolve(_.compact(this.collectionParam.mold))).to.eventually
#          .deep.equal([ { id: 2, name: 'name2', '$index': 2 } ]).notify(done)

#  it 'Many manupulations with collection', (done) ->
#    newItem = {id: 3, name: 'name3'}
#    expect(this.collectionParam.add(testValues[0])).notify =>
#      expect(this.collectionParam.add(testValues[1])).notify =>
#        expect(this.collectionParam.add(newItem)).notify =>
#          expect(this.collectionParam.remove({id: 2})).notify =>
#            #this.collectionParam.child(1).set('name', 'new name');
#            assert.deepEqual _.compact(this.collectionParam.mold), [
#              {
#                id: 1
#                name: 'name1'
#                $index: 1
#              }
#              {
#                id: 3
#                name: 'name3'
#                $index: 3
#              }
#            ]
#            done()
