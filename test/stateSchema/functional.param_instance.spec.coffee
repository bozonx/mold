stateSchema = require('stateSchema')

testSchema = () ->
  memoryBranch:
    inMemory:
      boolParam:
        type: 'boolean'
        default: false
      stringParam:
        type: 'string'
        default: 'defaultStringValue'
      numberParam:
        type: 'number'
        default: 5
      nested:
        nestedStringParam:
          type: 'string'
          default: 'defaultNestedStringValue'

describe 'Functional. Param instance', ->
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

#  it 'Has value. before and after setting a value', () ->
#    assert.isTrue(this.inMemory.has('stringParam'))
#    this.inMemory.set('stringParam', 'new value')
#    assert.isTrue(this.inMemory.has('stringParam'))

  it 'Reset to defaults one value', ->
    this.inMemory.resetToDefault('stringParam');
    assert.equal(this.inMemory.get('stringParam'), 'defaultStringValue')

  it 'Reset to defaults all children', ->
    this.inMemory.resetToDefault();
    assert.equal(this.inMemory.get('stringParam'), 'defaultStringValue')

    # TODO: !!!!!
    # TODO: Check number and boolean
    #assert.equal(this.inMemory.get('nested.nestedStringParam'), 'defaultNestedStringValue')
