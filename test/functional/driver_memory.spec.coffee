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

  it 'document_get', (done) ->
    driverHelpers.document_get(this.mold, 'root.document', done)

  it 'document_patch', (done) ->
    driverHelpers.document_patch(this.mold, 'root.document', done)

  it 'documentsCollection_create', (done) ->
    driverHelpers.documentsCollection_create(this.mold, 'root.documentsCollection', done)

  it 'documentsCollection_delete', (done) ->
    driverHelpers.documentsCollection_delete(this.mold, 'root.documentsCollection', done)

  it 'documentsCollection_filter', (done) ->
    driverHelpers.documentsCollection_filter(this.mold, 'root.documentsCollection', done)
