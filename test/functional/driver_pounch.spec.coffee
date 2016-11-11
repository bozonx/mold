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
    this.init('container_get')
    driverHelpers.container_get(this.mold, 'root.document')

  it 'container_set', (done) ->
    this.init('container_set')
    driverHelpers.container_set(this.mold, 'root.document', done)

  it 'collection_create', (done) ->
    this.init('collection_create')
    driverHelpers.collection_create(this.mold, 'root.documentsCollection', done)

#  it 'collection_delete', (done) ->
#    this.init('remove')
#    driverHelpers.collection_delete(this.mold, 'root.documentsCollection', done)

  it 'collection_filter', (done) ->
    this.init('filter')
    driverHelpers.collection_filter(this.mold, 'root.documentsCollection', done)
