mold = require('../../src/index')
PounchDb = require('../../src/drivers/PounchDb').default

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
      pounch = new PounchDb({
        # main config
      });
      this.testSchema = testSchema(pounch)
      this.mold = mold.initSchema( {}, this.testSchema )
      this.container = this.mold.instance('commonBranch.inPounch.doc1')

    it 'set string', (done) ->
      setPromise = this.container.set('stringParam', 'new value')
      expect(setPromise).to.eventually.have.property('successResponse')
      expect(setPromise).to.eventually.have.property('payload')
      expect(setPromise).notify(done)

    it 'set array', (done) ->
      value = [1,2,3]
      expect(this.container.set('arrayParam', value)).to.eventually.notify =>
        getPromise = this.container.get('arrayParam')

        expect(getPromise).to.eventually
          .property('payload').property('arrayParam').deep.equal(value)
          .notify(done);

    it 'get', (done) ->
      setPromise = this.container.set('stringParam', 'new value')
      expect(setPromise).to.eventually.notify =>
        getPromise = this.container.get('stringParam')
        expect(getPromise).to.eventually
          .property('payload').property('stringParam').equal('new value')
          .notify(done);

  describe 'Collection.', ->
    beforeEach ->
      pounch = new PounchDb({});
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
