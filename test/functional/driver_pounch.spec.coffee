PouchDB = require('pouchdb')
memdown = require('memdown')

mold = require('../../src/index').default
PounchDbDriver = require('../../src/drivers/PounchDb').default
driverHelpers = require('../_drivers_helpers.coffee')

testSchema = (pounch) ->
  root:
    type: 'container'
    driver: pounch.instance({})
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

describe 'Functional. PounchDb driver.', ->
  beforeEach ->
    this.init = (dbName) =>
      memdown.clearGlobalStore();
      pounch = new PounchDbDriver({
        db: new PouchDB(dbName, {db: memdown}),
      });
      this.testSchema = testSchema(pounch)
      this.mold = mold( {}, this.testSchema )

  it 'container_get', (done) ->
    this.init('document_get')
    driverHelpers.document_get(this.mold, 'root.document', done)

  it 'container_set', (done) ->
    this.init('document_set')
    driverHelpers.document_set(this.mold, 'root.document', done)

  it 'documentsCollection_create', (done) ->
    this.init('collection_create')
    driverHelpers.documentsCollection_create(this.mold, 'root.documentsCollection', done)

#  it 'documentsCollection_delete', (done) ->
#    this.init('remove')
#    driverHelpers.documentsCollection_delete(this.mold, 'root.documentsCollection', done)

  it 'documentsCollection_filter', (done) ->
    this.init('filter')
    driverHelpers.documentsCollection_filter(this.mold, 'root.documentsCollection', done)
