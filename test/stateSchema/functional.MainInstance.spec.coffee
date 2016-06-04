stateSchema = require('stateSchema')

testSchema = () ->
  memoryBranch:
    inMemory:
      stringParam1:
        type: 'string'
      stringParam2:
        type: 'string'
      nested:
        nestedStringParam1:
          type: 'string'
        nestedStringParam2:
          type: 'string'

describe 'functional ItemInstance', ->
  beforeEach () ->
    this.state = stateSchema.initSchema( testSchema() )

  it 'Set full pack of params', () ->
    values =
      memoryBranch:
        inMemory:
          stringParam1: 'savedString1'
          stringParam2: 'savedString2'
        nested:
          nestedStringParam1: 'savedNestedString1'
          nestedStringParam2: 'savedNestedString2'
    this.state.setSilent(values)

    assert.equal(this.state.get('memoryBranch.inMemory.stringParam1'), 'savedString1')
    assert.equal(this.state.get('memoryBranch.inMemory.stringParam2'), 'savedString2')
    assert.equal(this.state.get('memoryBranch.inMemory.nested.nestedStringParam1'), 'savedNestedString1')
    assert.equal(this.state.get('memoryBranch.inMemory.nested.nestedStringParam2'), 'nestedStringParam2')
