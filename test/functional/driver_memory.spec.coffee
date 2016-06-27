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

  describe 'Common usage.', ->
    beforeEach ->
      memory = new Memory({});
      this.testSchema = testSchema(memory)
      this.mold = mold.initSchema( {}, this.testSchema )
      this.container = this.mold.instance('commonBranch.inMemory')

    it 'set string', ->
      driverHelpers.check_responce_set_primitive(this.container)

    it 'set array', () ->
      driverHelpers.check_responce_set_array(this.container)

    it 'set and get string', ->
      driverHelpers.set_and_get_primitive(this.container, done)

    it 'set and get array', (done) ->
      driverHelpers.set_and_get_array(this.container, done)

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




