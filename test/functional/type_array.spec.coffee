mold = require('../../src/index')

testSchema = () ->
  inMemory:
    arrayParam:
      type: 'array'
      itemsType: 'string',

describe 'Functional. Array instance.', ->
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
    promise = this.arrayParam.set(this.arrayValues);
    assert.equal(this.arrayParam.mold, this.arrayValues)
    expect(promise).to.eventually.equal(this.arrayValues)
