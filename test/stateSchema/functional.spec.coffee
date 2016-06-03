stateSchema = require('stateSchema')

testSchema = () ->
  memoryBranch:
    inMemory:
      boolParam:
        type: 'boolean'
        default: false
      stringParam:
        type: 'string'
        default: 'stringValue'
      numberParam:
        type: 'number'
        default: 5

describe 'functional', ->
  beforeEach () ->
    this.state = stateSchema.initSchema( testSchema() )
    this.inMemory = this.state.instance('memoryBranch.inMemory')

  it 'Get initial value, it must returns undefined', () ->
    assert.isNull(this.inMemory.get('stringParam'))
    assert.isNull(this.inMemory.mold.stringParam)

  it 'Set and get value', () ->
    this.inMemory.set('stringParam', 'new value')
    assert.equal(this.inMemory.get('stringParam'), 'new value')
    assert.equal(this.inMemory.mold.stringParam, 'new value')

  it 'Has value. before and after setting a value', () ->
    assert.isTrue(this.inMemory.has('stringParam'))
    this.inMemory.set('stringParam', 'new value')
    assert.isTrue(this.inMemory.has('stringParam'))
