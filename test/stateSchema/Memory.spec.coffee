###
stateSchema = require('stateSchema')
Memory = require('stateSchema/handlers/Memory').default

schema = (memory) ->
  inMemory: memory
    boolParam:
      type: 'boolean'
      default: false
    stringParam:
      type: 'string'
      default: 'stringValue'
    numberParam:
      type: 'number'
      default: 5

describe 'stateSchema', ->
  beforeEach () ->
    this.memoryHandler = new Memory({})
    this.completeSchema = schema(this.memoryHandler.schemaHandler.bind(this.memoryHandler))
    this.state = stateSchema.initSchema( this.completeSchema )
    this.schema = this.state.schemaManager.getSchema()

  it 'check memory handler', () ->
    assert.equal(this.schema.inMemory.handler, this.memoryHandler)

  it 'get initial value', () ->
    assert.equal(this.state.get('inMemory.stringParam'), this.completeSchema.inMemory.schema.stringParam.default)

  it 'set and get it', () ->
    this.state.set('inMemory.stringParam', 'new string')
    assert.equal(this.state.get('inMemory.stringParam'), 'new string')

  it 'hasValue', () ->
    assert.equal(this.state.has('inMemory.stringParam'), true)
###
