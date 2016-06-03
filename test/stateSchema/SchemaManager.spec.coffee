###
SchemaManager = require('stateSchema/SchemaManager').default
State = require('stateSchema/State').default

Memory = require('stateSchema/handlers/Memory').default

memory = new Memory({});
schema =
  first: memory.schemaHandler
    second:
      third: 1

describe 'SchemaManager', ->
  beforeEach () ->
    this.schemaManager = new SchemaManager()
    this.state = new State()
    this.schemaManager.init(schema, this.state);
    this.state.init(this.schemaManager);

  it 'getHandler - get last', () ->
    assert.equal(this.schemaManager.getHandler('first'), memory)
    assert.equal(this.schemaManager.getHandler('first.second'), memory)

  it 'getHandler - get from deep', () ->
    assert.equal(this.schemaManager.getHandler('first.second.third'), memory)

  it 'getHandler - get nothing', () ->
    #schemaManager = new SchemaManager(schema)
    # TODO: должна быть risen ошибка
    #assert.equal(schemaManager.getHandler('no-one'), undefined);

  # TODO:
#  it 'getHandler - get closest', () ->
#    anotherMemory = new Memory({});
#    schema =
#      first: memory.schemaHandler
#        second: anotherMemory.schemaHandler
#          third: 1
#    schemaManager = new SchemaManager(schema)
#
#    assert.equal(schemaManager.getHandler('first.second.third'), anotherMemory)
###
