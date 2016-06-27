mold = require('../../src/index')
Memory = require('../../src/drivers/Memory').default
driverHelpers = require('../_drivers_helpers.coffee')

testSchema = (memory) ->
  commonBranch:
    inMemory: memory.schema({}, {
      stringParam: {type: 'string'}
      arrayParam: {type: 'array'}
      collection: {
        type: 'collection'
        item: {
          id: {type: 'number', primary: true}
          name: {type: 'string'}
        }
      }
    })

describe 'Functional. Memory driver.', ->

  describe 'Primitives and array.', ->
    beforeEach ->
      memory = new Memory({});
      this.testSchema = testSchema(memory)
      this.mold = mold.initSchema( {}, this.testSchema )
      this.container = this.mold.instance('commonBranch.inMemory')
      #this.driverInstance = this.mold.schemaManager.getDriver('commonBranch.inMemory')

    it 'get primitive', (done) ->
      driverHelpers.get_primitive(this.mold, 'commonBranch.inMemory', done)
      
    it 'set primitive', (done) ->
      driverHelpers.set_primitive(this.mold, 'commonBranch.inMemory', done)

    it 'get array', (done) ->
      driverHelpers.get_array(this.mold, 'commonBranch.inMemory', done)
      
    it 'set array', (done) ->
      driverHelpers.set_array(this.mold, 'commonBranch.inMemory', done)


      
      
      
  describe 'Collection.', ->
    beforeEach ->
      memory = new Memory({});
      this.testSchema = testSchema(memory)
      this.mold = mold.initSchema( {}, this.testSchema )
      this.container = this.mold.instance('commonBranch.inMemory')
      this.collection = this.mold.instance('commonBranch.inMemory.collection')

#    it 'add', ->
#      promise = this.collection.add({name: 'name3'})
#      expect(promise).to.eventually.property('payload').deep.equal({ name: 'name3', id: 0, $index:0 })

    it 'add and find', ->
      # TODO: !!!
#      promise = this.collection.add({name: 'name3'})
#      expect(promise).notify =>
#        expect(this.collection.find('arrayParam')).to.eventually.property('payload').deep.equal(value).notify(done)


    it 'remove', ->
      # TODO: !!!

    it 'find', ->
      # TODO: !!!

    it 'filter', ->
      # TODO: !!!




