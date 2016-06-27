mold = require('../../src/index')

testSchema = () ->
  inMemory:
    arrayParam:
      type: 'array'
      itemsType: 'string',

describe 'Functional. Array Type.', ->
  beforeEach () ->
    this.mold = mold.initSchema( {}, testSchema() )
    this.arrayParam = this.mold.instance('inMemory.arrayParam')
    this.arrayValues = ['value1', 'value2']

  it 'After init it\'s an empty []', () ->
    assert.deepEqual(this.arrayParam.mold, [])

  it 'Set array and check mold', (done) ->
    expect(this.arrayParam.set(this.arrayValues)).to.eventually.notify =>
      expect(Promise.resolve(this.arrayParam.mold)).to.eventually.deep.equal(this.arrayValues).notify(done)

  it 'Set and get array', () ->
    expect(this.arrayParam.set(this.arrayValues)).to.eventually.notify =>
      expect(this.arrayParam.get()).to.eventually.property('coocked').deep.equal(this.arrayValues).notify(done)
