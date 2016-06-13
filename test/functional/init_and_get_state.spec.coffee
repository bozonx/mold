mold = require('../../src/index')

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

describe 'Functional. Init and get all values.', ->
  beforeEach () ->
    this.mold = mold.initSchema( {}, testSchema() )

  it 'Set full pack of values', () ->
    values =
      memoryBranch:
        inMemory:
          stringParam1: 'savedString1'
          stringParam2: 'savedString2'
          nested:
            nestedStringParam1: 'savedNestedString1'
            nestedStringParam2: 'savedNestedString2'
    this.mold.initState(values)

    assert.equal(this.mold.state.getComposition('memoryBranch.inMemory.stringParam1'), 'savedString1')
    assert.equal(this.mold.state.getComposition('memoryBranch.inMemory.stringParam2'), 'savedString2')
    assert.equal(this.mold.state.getComposition('memoryBranch.inMemory.nested.nestedStringParam1'), 'savedNestedString1')
    assert.equal(this.mold.state.getComposition('memoryBranch.inMemory.nested.nestedStringParam2'), 'savedNestedString2')

  it 'values to path', () ->
    values =
      nested:
        nestedStringParam1: 'savedNestedString1'
        nestedStringParam2: 'savedNestedString2'
    this.mold.initState('memoryBranch.inMemory', values)

    assert.equal(this.mold.state.getComposition('memoryBranch.inMemory.nested.nestedStringParam1'), 'savedNestedString1')
    assert.equal(this.mold.state.getComposition('memoryBranch.inMemory.nested.nestedStringParam2'), 'savedNestedString2')

  it 'set one value', () ->
    this.mold.initState('memoryBranch.inMemory.nested.nestedStringParam1', 'savedNestedString1')
    assert.equal(this.mold.state.getComposition('memoryBranch.inMemory.nested.nestedStringParam1'), 'savedNestedString1')

  it 'values doesn\'t correspond to schema', () ->
    values =
      memoryBranch:
        inMemory:
          stringParam1: 'savedString1'
          anotherParam: 'anotherParamValue'
          nested:
            nestedStringParam1: 'savedNestedString1'
            nestedAnotherParam: 'nestedAnotherParamValue'
    this.mold.initState(values)

    # TODO: во время запуска initState - нужно установить null чистым значениям
    
    assert.equal(this.mold.state.getComposition('memoryBranch.inMemory.stringParam1'), 'savedString1')
    #assert.isNull(this.mold.state.getComposition('memoryBranch.inMemory.stringParam2'))
    assert.equal(this.mold.state.getComposition('memoryBranch.inMemory.nested.nestedStringParam1'), 'savedNestedString1')
    #assert.isNull(this.mold.state.getComposition('memoryBranch.inMemory.nested.nestedStringParam2'))
    
    # get directly from composition
    assert.equal(this.mold.state.getComposition('memoryBranch.inMemory.stringParam1'), 'savedString1')
    assert.isUndefined(this.mold.state.getComposition('memoryBranch.inMemory.anotherParam'))
    assert.isUndefined(this.mold.state.getComposition('memoryBranch.inMemory.nested.nestedAnotherParam'))

  it 'get full state', () ->
    values =
      memoryBranch:
        inMemory:
          stringParam1: 'savedString1'
          stringParam2: 'savedString2'
          nested:
            nestedStringParam1: 'savedNestedString1'
            nestedStringParam2: 'savedNestedString2'
    this.mold.initState(values)
    fullState = this.mold.state.getComposition('')

    assert.deepEqual(fullState, values)

