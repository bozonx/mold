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
            created: {type: 'number'}

describe 'Functional. Memory driver.', ->
  beforeEach ->
    memory = new Memory({});
    this.testSchema = testSchema(memory)
    this.mold = mold( {silent: true}, this.testSchema )

  it 'document_get', (done) ->
    driverHelpers.document_get(this.mold, 'root.document', done)

  it 'document_put', () ->
    driverHelpers.document_put(this.mold, 'root.document')

  it 'document_patch', (done) ->
    driverHelpers.document_patch(this.mold, 'root.document', done)

  it 'documentsCollection_create', () ->
    driverHelpers.documentsCollection_create(this.mold, 'root.documentsCollection')

  it 'documentsCollection_remove', (done) ->
    driverHelpers.documentsCollection_remove(this.mold, 'root.documentsCollection', done)

#  it 'documentsCollection_filter', (done) ->
#    driverHelpers.documentsCollection_filter(this.mold, 'root.documentsCollection', done)

  it 'documentsCollection_filter_paged', (done) ->
    driverHelpers.documentsCollection_filter_paged(this.mold, 'root.documentsCollection', done)
