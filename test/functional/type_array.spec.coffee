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

  it 'Get array. It returns a promise', () ->
    this.mold.state.setComposition('inMemory.arrayParam', this.arrayValues)
    promise = this.arrayParam.get();

    expect(promise).to.eventually.equal(this.arrayValues)
    assert.equal(this.arrayParam.mold, this.arrayValues)

  it 'Set array', () ->
    expect(this.arrayParam.set(this.arrayValues)).to.eventually.property('payload').equal(this.arrayValues)

  it 'Set array - check mold', (done) ->
    expect(this.arrayParam.set(this.arrayValues)).to.eventually.notify =>
      expect(Promise.resolve(this.arrayParam.mold)).to.eventually.equal(this.arrayValues).notify(done)
