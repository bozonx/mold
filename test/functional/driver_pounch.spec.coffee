PouchDB = require('pouchdb')
memdown = require('memdown')

mold = require('../../src/index')
PounchDbDriver = require('../../src/drivers/PounchDb').default
driverHelpers = require('../_drivers_helpers.coffee')

testSchema = (pounch) ->
  commonBranch:
    inPounch: pounch.schema({}, {
      docContainer: {document: {}, schema: {
        booleanParam: {type: 'boolean'}
        stringParam: {type: 'string'}
        numberParam: {type: 'number'}
        arrayParam: {type: 'array'}
      }}
      docCollection: {document: {}, schema: {
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

    it 'container_get', (done) ->
      driverHelpers.container_get(this.mold, 'commonBranch.inPounch.docContainer', done)

    it 'container_set', (done) ->
      driverHelpers.container_set(this.mold, 'commonBranch.inPounch.docContainer', done)

#    it 'get array', (done) ->
#      driverHelpers.get_array(this.mold, 'commonBranch.inPounch.docContainer', done)
#
#    it 'set array', (done) ->
#      driverHelpers.set_array(this.mold, 'commonBranch.inPounch.docContainer', done)

  describe 'Collection.', ->
    it 'collection_add', (done) ->
      this.init('add')
      driverHelpers.collection_add(this.mold, 'commonBranch.inPounch.docCollection', done)

    it 'collection_remove', (done) ->
      this.init('remove')
      driverHelpers.collection_remove(this.mold, 'commonBranch.inPounch.docCollection', done)

#    it 'collection_get_item_and_get_primitive', (done) ->
#      this.init('getItem')
#      driverHelpers.collection_get_item_and_get_primitive(this.mold, 'commonBranch.inPounch.docColl', done)


  # TODO: config
