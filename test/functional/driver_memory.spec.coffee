mold = require('../../src/index').default
Memory = require('../../src/drivers/Memory').default
driverHelpers = require('../_drivers_helpers.coffee')

testSchema = (memory) ->
  inMemory:
    type: 'container'
    driver: memory.instance({})
    schema:
      document:
        type: 'document'
        schema:
          booleanParam: {type: 'boolean'}
          stringParam: {type: 'string'}
          numberParam: {type: 'number'}
          arrayParam: {type: 'array'}
      documentsCollection:
        type: 'documentsCollection'
        item:
          type: 'document'
          schema:
            id: {type: 'number', primary: true}
            name: {type: 'string'}

describe 'Functional. Memory driver.', ->
  beforeEach ->
    memory = new Memory({});
    this.testSchema = testSchema(memory)
    this.mold = mold( {}, this.testSchema )

  it 'container_get', (done) ->
    driverHelpers.container_get(this.mold, 'inMemory.container', done)

  it 'container_set', (done) ->
    driverHelpers.container_set(this.mold, 'inMemory.container', done)

  it 'collection_filter', (done) ->
    driverHelpers.collection_filter(this.mold, 'inMemory.documentsCollection', done)

  it 'collection_add', (done) ->
    driverHelpers.collection_add(this.mold, 'inMemory.documentsCollection', done)

  it 'collection_remove', (done) ->
    driverHelpers.collection_remove(this.mold, 'inMemory.documentsCollection', done)
