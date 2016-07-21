PouchDB = require('pouchdb')
memdown = require('memdown')

mold = require('../../src/index')
PounchDbDriver = require('../../src/drivers/PounchDb').default
driverHelpers = require('../_drivers_helpers.coffee')

testSchema = (pounch) ->
  commonBranch:
    inPounch: pounch.schema({}, {
      doc1: {document: {}, schema: {
        stringParam: {type: 'string'}
        arrayParam: {type: 'array'}
      }}
      docColl: {document: {}, schema: {
        type: 'collection'
        item: {
          id: {type: 'number', primary: true}
          name: {type: 'string'}
        }
      }}
    })

describe 'Functional. PounchDb driver.', ->
  beforeEach ->
    this.init = (dbName) =>
      memdown.clearGlobalStore();
      pounch = new PounchDbDriver({
        db: new PouchDB(dbName, {db: memdown}),
      });
      this.testSchema = testSchema(pounch)
      this.mold = mold.initSchema( {}, this.testSchema )

  describe 'Common usage.', ->
    beforeEach ->
      this.init('container')

    it 'get_primitive_check_responce', (done) ->
      driverHelpers.get_primitive_check_responce(this.mold, 'commonBranch.inPounch.doc1', done)

    it 'get_primitive_check_mold', (done) ->
      driverHelpers.get_primitive_check_mold(this.mold, 'commonBranch.inPounch.doc1', done)

    it 'set_primitive_check_response', (done) ->
      driverHelpers.set_primitive_check_response(this.mold, 'commonBranch.inPounch.doc1', done)

    it 'set_primitive_check_mold', (done) ->
      driverHelpers.set_primitive_check_mold(this.mold, 'commonBranch.inPounch.doc1', done)

    it 'get array', (done) ->
      driverHelpers.get_array(this.mold, 'commonBranch.inPounch.doc1', done)

    it 'set array', (done) ->
      driverHelpers.set_array(this.mold, 'commonBranch.inPounch.doc1', done)

  describe 'Collection.', ->
    it 'collection_add', (done) ->
      this.init('add')
      driverHelpers.collection_add(this.mold, 'commonBranch.inPounch.docColl', done)

    it 'collection_remove', (done) ->
      this.init('remove')
      driverHelpers.collection_remove(this.mold, 'commonBranch.inPounch.docColl', done)

    it 'collection_get_item_and_get_primitive', (done) ->
      this.init('getItem')
      driverHelpers.collection_get_item_and_get_primitive(this.mold, 'commonBranch.inPounch.docColl', done)


  # TODO: config
