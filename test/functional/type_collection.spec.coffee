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

  it 'child()', ->
    this.container.setSilent('collectionParam', testValues)
    assert.equal(this.collectionParam.child(2).mold.name, 'name2');

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
#    this.arrayParam.setSilent(this.arrayValues)
#    this.arrayParam.clear()
#    assert.equal(this.arrayParam.mold.length, 0)

  it '_convertPrimaryToIndexesInPath', ->
    store = {
      aa: [
        {id: 1},
        {id: 2},
      ],
      bb: [
        {
          id: 22,
          children: [
            {id: 222},
          ]
        }
      ]
    }
    _convert = this.mold._composition._convertPrimaryToIndexesInPath

    assert.equal(_convert(store, 'aa{2}.name', 'id'), 'aa[1].name')
    assert.equal(_convert(store, 'bb{22}.children{222}', 'id'), 'bb[0].children[0]')
    assert.isUndefined(_convert(store, 'bb{223}.children{222}', 'id'))

  it 'Many manupulations with collection', ->
    newItem = {id: 3, name: 'name3'}
    this.container.setSilent('collectionParam', testValues)
    this.collectionParam.add(newItem)
    this.collectionParam.remove({id: 2})
    this.collectionParam.child(1).set('name', 'new name');
    # TODO: test deep with two collections
    assert.deepEqual(_.compact(this.collectionParam.mold), [
      {
        id: 1
        name: 'new name'
      }
      {
        id: 3
        name: 'name3'
      }
    ])
