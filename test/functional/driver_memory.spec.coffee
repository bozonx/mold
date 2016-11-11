mold = require('../../src/index').default
Memory = require('../../src/drivers/Memory').default
driverHelpers = require('../_drivers_helpers.coffee')

testSchema = (memory) ->
  root:
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
    driverHelpers.container_get(this.mold, 'root.document', done)

  it 'container_set', (done) ->
    driverHelpers.container_set(this.mold, 'root.document', done)

  it 'collection_create', (done) ->
    driverHelpers.collection_create(this.mold, 'root.documentsCollection', done)

#  it 'collection_delete', (done) ->
#    driverHelpers.collection_delete(this.mold, 'root.documentsCollection', done)

  it 'collection_filter', (done) ->
    driverHelpers.collection_filter(this.mold, 'root.documentsCollection', done)
