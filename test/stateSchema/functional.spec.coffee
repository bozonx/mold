stateSchema = require('stateSchema')

testSchema = () ->
  inMemory:
    params:
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

  it 'Get initial value, it must returns undefined', () ->
    params = this.state.instance('params')
    assert.isNull(params.get('stringParam'))
    assert.isUndefined(params.mold.stringParam)

  it 'Set and get value', () ->
