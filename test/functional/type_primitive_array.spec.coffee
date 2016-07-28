mold = require('../../src/index')

testSchema = () ->
  inMemory:
    arrayParam:
      type: 'array'
      itemsType: 'string',

describe 'Functional. Primitive array Type.', ->
  beforeEach () ->
    this.mold = mold.initSchema( {}, testSchema() )
    this.container = this.mold.instance('inMemory')
    this.arrayValues = ['value1', 'value2']

  it 'After init it\'s an empty []', () ->
    primitive = this.container.child('arrayParam')
    assert.deepEqual(primitive.mold, [])

  it 'get() and check response', ->
    _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.arrayParam', this.arrayValues)
    primitive = this.container.child('arrayParam')
    expect(primitive.get()).to.eventually.property('coocked').deep.equal(this.arrayValues)

  it 'get() and check mold', (done) ->
    _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.arrayParam', this.arrayValues)
    primitive = this.container.child('arrayParam')
    expect(primitive.get()).to.eventually.notify =>
      expect(Promise.resolve(primitive.mold)).to.eventually
      .deep.equal(this.arrayValues)
      .notify(done)

  it 'set via conatiner', ->
    this.container.setMold('arrayParam', this.arrayValues)

    assert.deepEqual(this.container.child('arrayParam').mold, this.arrayValues)

  it 'setMold and save', ->
    primitive = this.container.child('arrayParam')
    primitive.setMold(this.arrayValues)

    assert.deepEqual(primitive.mold, this.arrayValues)
    expect(primitive.save()).to.eventually
    .property('coocked').deep.equal(this.arrayValues)
