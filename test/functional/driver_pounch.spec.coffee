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

    it 'get primitive', (done) ->
      driverHelpers.get_primitive(this.mold, 'commonBranch.inPounch.doc1', done)

    it 'set primitive', (done) ->
      driverHelpers.set_primitive(this.mold, 'commonBranch.inPounch.doc1', done)

    it 'get array', (done) ->
      driverHelpers.get_array(this.mold, 'commonBranch.inPounch.doc1', done)

    it 'set array', (done) ->
      driverHelpers.set_array(this.mold, 'commonBranch.inPounch.doc1', done)


#    it 'get', (done) ->
#      setPromise = this.container.set('stringParam', 'new value')
#      expect(setPromise).to.eventually.notify =>
#        getPromise = this.container.get('stringParam')
#        expect(getPromise).to.eventually
#          .property('payload').property('stringParam').equal('new value')
#          .notify(done);

        
        
        
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
