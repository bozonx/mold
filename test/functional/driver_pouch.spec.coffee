PouchDB = require('pouchdb')
memdown = require('memdown')
PouchDB.plugin(require('pouchdb-find'));

mold = require('../../src/index').default
PouchDbDriver = require('../../src/drivers/PouchDb').default
driverHelpers = require('../_drivers_helpers.coffee')

testSchema = (pouch) ->
  root:
    type: 'container'
    driver: pouch.instance({})
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

describe 'Functional. PouchDb driver.', ->
  beforeEach ->
    this.init = (dbName) =>
      memdown.clearGlobalStore();
      pouch = new PouchDbDriver({
        db: new PouchDB(dbName, {db: memdown}),
      });
      this.testSchema = testSchema(pouch)
      this.mold = mold( {silent: true}, this.testSchema )

  it 'document_get', (done) ->
    this.init('document_get')
    driverHelpers.document_get(this.mold, 'root.document', done)

  it 'document_get_error', (done) ->
    this.init('document_get_error')
    driverHelpers.document_get_error(this.mold, 'root.document', done)

  it 'document_put', (done) ->
    this.init('document_put')
    driverHelpers.document_put(this.mold, 'root.document', done)

  it 'document_patch', (done) ->
    this.init('document_patch')
    driverHelpers.document_patch(this.mold, 'root.document', done)

  it 'documentsCollection_create', (done) ->
    this.init('collection_create')
    driverHelpers.documentsCollection_create(this.mold, 'root.documentsCollection', done)

  it 'documentsCollection_delete', (done) ->
    this.init('delete')
    driverHelpers.documentsCollection_delete(this.mold, 'root.documentsCollection', done)

#  it 'documentsCollection_filter', (done) ->
#    this.init('filter')
#    driverHelpers.documentsCollection_filter(this.mold, 'root.documentsCollection', done)

  it 'documentsCollection_filter_paged', (done) ->
    this.init('paged')
    driverHelpers.documentsCollection_filter_paged(this.mold, 'root.documentsCollection', done)

  it "_id and _rev have to save", (done) ->
    this.init('_id_rev')
    pathToDoc = 'root.document'
    payload =
      stringParam: 'newValue'
    document = this.mold.child(pathToDoc)
    document.update(payload)

    promise = document.put()
    expect(promise).to.eventually.notify =>
      expect(Promise.all([
        expect(Promise.resolve(document.mold._id)).to.eventually.equal('/document')
        expect(Promise.resolve(document.mold._rev.length == 34)).to.eventually.equal(true)
      ])).to.eventually.notify(done)
