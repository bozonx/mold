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

  it 'init via container', ->
    this.container.setSilent('collectionParam', testValues)
    assert.deepEqual(this.container.mold.collectionParam, testValues)
    assert.deepEqual(this.collectionParam.mold, testValues)

  it 'child()', (done) ->
    expect(this.collectionParam.add(testValues[0])).notify =>
      expect(this.collectionParam.add(testValues[1])).notify =>
        assert.equal(this.collectionParam.child(2).mold.name, 'name2')
        done()

  it 'filter()', ->
    data = [
      {id:1, name: 'e'}
      {id:2, name: 'r'}
      {id:3, name: 'e'}
    ]
    this.container.setSilent('collectionParam', data)
    expect(this.collectionParam.filter({name:'e'}))
      .to.eventually.deep.equal([data[0], data[2]])

  it 'page()', ->
    # TODO: do it

  it 'find()', ->
    this.container.setSilent('collectionParam', testValues)
    expect(this.collectionParam.find({id:2}))
      .to.eventually.deep.equal(testValues[1])

  it 'item()', ->
    this.container.setSilent('collectionParam', testValues)
    expect(this.collectionParam.item(2))
      .to.eventually.deep.equal(testValues[1])

  it 'add()', ->
    promise = this.collectionParam.add({id: 3, name: 'name3'})
    expect(promise).to.eventually.property('payload').deep.equal({id: 3, name: 'name3', $primary: 3})

  it 'remove()', (done) ->
    expect(this.collectionParam.add(testValues[0])).notify =>
      expect(this.collectionParam.add(testValues[1])).notify =>
        expect(this.collectionParam.remove(testValues[0])).notify =>
          assert.deepEqual(_.compact(this.collectionParam.mold), [ { id: 2, name: 'name2', '$primary': 2 } ])
          done()

  it 'has()', ->
    # TODO: do it

  it 'clear()', ->
    # TODO: do it
#    this.arrayParam.setSilent(this.arrayValues)
#    this.arrayParam.clear()
#    assert.equal(this.arrayParam.mold.length, 0)

  it 'Many manupulations with collection', (done) ->
    newItem = {id: 3, name: 'name3'}
    expect(this.collectionParam.add(testValues[0])).notify =>
      expect(this.collectionParam.add(testValues[1])).notify =>
        expect(this.collectionParam.add(newItem)).notify =>
          expect(this.collectionParam.remove({id: 2})).notify =>
            #this.collectionParam.child(1).set('name', 'new name');
            assert.deepEqual _.compact(this.collectionParam.mold), [
              {
                id: 1
                name: 'name1'
                $primary: 1
              }
              {
                id: 3
                name: 'name3'
                $primary: 3
              }
            ]
            done()
