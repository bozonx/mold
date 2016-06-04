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

describe 'functional Init and get all values', ->
  beforeEach () ->
    this.state = stateSchema.initSchema( testSchema() )

  it 'Set full pack of values', () ->
    values =
      memoryBranch:
        inMemory:
          stringParam1: 'savedString1'
          stringParam2: 'savedString2'
          nested:
            nestedStringParam1: 'savedNestedString1'
            nestedStringParam2: 'savedNestedString2'
    this.state.initState(values)

    assert.equal(this.state.get('memoryBranch.inMemory.stringParam1'), 'savedString1')
    assert.equal(this.state.get('memoryBranch.inMemory.stringParam2'), 'savedString2')
    assert.equal(this.state.get('memoryBranch.inMemory.nested.nestedStringParam1'), 'savedNestedString1')
    assert.equal(this.state.get('memoryBranch.inMemory.nested.nestedStringParam2'), 'savedNestedString2')

  it 'values to path', () ->
    values =
      nested:
        nestedStringParam1: 'savedNestedString1'
        nestedStringParam2: 'savedNestedString2'
    this.state.initState('memoryBranch.inMemory', values)

    assert.equal(this.state.get('memoryBranch.inMemory.nested.nestedStringParam1'), 'savedNestedString1')
    assert.equal(this.state.get('memoryBranch.inMemory.nested.nestedStringParam2'), 'savedNestedString2')

  it 'set one value', () ->
    this.state.initState('memoryBranch.inMemory.nested.nestedStringParam1', 'savedNestedString1')
    assert.equal(this.state.get('memoryBranch.inMemory.nested.nestedStringParam1'), 'savedNestedString1')

  it 'values doesn\'t correspond to schema', () ->
    values =
      memoryBranch:
        inMemory:
          stringParam1: 'savedString1'
          anotherParam: 'anotherParamValue'
          nested:
            nestedStringParam1: 'savedNestedString1'
            nestedAnotherParam: 'nestedAnotherParamValue'
    this.state.initState(values)

    assert.equal(this.state.get('memoryBranch.inMemory.stringParam1'), 'savedString1')
    assert.isNull(this.state.get('memoryBranch.inMemory.stringParam2'))
    assert.equal(this.state.get('memoryBranch.inMemory.nested.nestedStringParam1'), 'savedNestedString1')
    assert.isNull(this.state.get('memoryBranch.inMemory.nested.nestedStringParam2'))
    # get directly from composition
    assert.equal(this.state._state.getDirectly('memoryBranch.inMemory.stringParam1'), 'savedString1')
    assert.isUndefined(this.state._state.getDirectly('memoryBranch.inMemory.anotherParam'))
    assert.isUndefined(this.state._state.getDirectly('memoryBranch.inMemory.nested.nestedAnotherParam'))
