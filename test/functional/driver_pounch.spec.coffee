PouchDB = require('pouchdb')

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

  describe 'Common usage.', ->
    beforeEach ->
      pounch = new PounchDbDriver({
        db: new PouchDB('myDB', {db: require('memdown')}),
      });
      this.testSchema = testSchema(pounch)
      this.mold = mold.initSchema( {}, this.testSchema )
      this.container = this.mold.instance('commonBranch.inPounch.doc1')

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
    beforeEach ->
      pounch = new PounchDbDriver({
        db: new PouchDB('myDB', {db: require('memdown')}),
      });
      this.testSchema = testSchema(pounch)
      this.mold = mold.initSchema( {}, this.testSchema )
      this.collection = this.mold.instance('commonBranch.inPounch.docColl')

    it 'add', ->
#      addPromise = this.collection.add({name: 'name3'})
#      expect(addPromise).to.eventually.property('payload').deep.equal([{id: 0, name: 'name3'}])


    it 'remove', ->

    it 'find', ->

    it 'filter', ->



  # TODO: config
