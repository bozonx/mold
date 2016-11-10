PouchDB = require('pouchdb')
memdown = require('memdown')

mold = require('../../src/index').default
PounchDbDriver = require('../../src/drivers/PounchDb').default
driverHelpers = require('../_drivers_helpers.coffee')

testSchema = (pounch) ->
  inPounch:
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
    driverHelpers.container_get(this.mold, 'inPounch.document', done)

  it 'container_set', (done) ->
    this.init('container_set')
    driverHelpers.container_set(this.mold, 'inPounch.document', done)

  it 'collection_filter', (done) ->
    this.init('filter')
    driverHelpers.collection_filter(this.mold, 'inPounch.documentsCollection', done)

  it 'collection_add', (done) ->
    this.init('add')
    driverHelpers.collection_add(this.mold, 'inPounch.documentsCollection', done)

  it 'collection_remove', (done) ->
    this.init('remove')
    driverHelpers.collection_remove(this.mold, 'inPounch.documentsCollection', done)
