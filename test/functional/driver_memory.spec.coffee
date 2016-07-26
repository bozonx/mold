mold = require('../../src/index')
Memory = require('../../src/drivers/Memory').default
driverHelpers = require('../_drivers_helpers.coffee')

testSchema = (memory) ->
  commonBranch:
    inMemory: memory.schema({}, {
      container: {
        booleanParam: {type: 'boolean'}
        stringParam: {type: 'string'}
        numberParam: {type: 'number'}
        arrayParam: {type: 'array'}
      }
      collection: {document: {}, schema: {
        type: 'collection'
        item: {
          id: {type: 'number', primary: true}
          name: {type: 'string'}
        }
      }}
    })

describe 'Functional. Memory driver.', ->
  beforeEach ->
    memory = new Memory({});
    this.testSchema = testSchema(memory)
    this.mold = mold.initSchema( {}, this.testSchema )
    this.container = this.mold.instance('commonBranch.inMemory.container')

  describe 'Primitives and array.', ->
    it 'get_primitive_check_responce', (done) ->
      driverHelpers.get_primitive_check_responce(this.mold, 'commonBranch.inMemory.container', done)

#    it 'get_primitive_check_mold', (done) ->
#      driverHelpers.get_primitive_check_mold(this.mold, 'commonBranch.inMemory', done)

    it 'container_set', (done) ->
      driverHelpers.container_set(this.mold, 'commonBranch.inMemory.container', done)

#    it 'container_set_check_mold', (done) ->
#      driverHelpers.container_set_check_mold(this.mold, 'commonBranch.inMemory', done)

#    it 'get array', (done) ->
#      driverHelpers.get_array(this.mold, 'commonBranch.inMemory', done)
#
#    it 'set array', (done) ->
#      driverHelpers.set_array(this.mold, 'commonBranch.inMemory', done)

  describe 'Collection.', ->
    it 'collection_add', (done) ->
      driverHelpers.collection_add(this.mold, 'commonBranch.inMemory.collection', done)

    it 'collection_remove', (done) ->
      driverHelpers.collection_remove(this.mold, 'commonBranch.inMemory.collection', done)

#    it 'collection_get_item_and_get_primitive', (done) ->
#      driverHelpers.collection_get_item_and_get_primitive(this.mold, 'commonBranch.inMemory.collection', done)
