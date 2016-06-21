mold = require('../../src/index')
Memory = require('../../src/drivers/Memory').default

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
      promise = this.container.set('stringParam', 'new value')
      expect(promise).to.eventually.property('payload').equal('new value')

    it 'set sand get string', (done) ->
      promise = this.container.set('stringParam', 'new value')
      expect(promise).to.eventually.notify =>
        expect(this.container.get('stringParam')).to.eventually.property('payload').equal('new value').notify(done)

    it 'set array', () ->
      value = [1,2,3]
      promise = this.container.set('arrayParam', value)
      expect(promise).to.eventually.property('payload').deep.equal(value)

    it 'set and get array', (done) ->
      value = [1,2,3]
      promise = this.container.set('arrayParam', value)
      expect(promise).notify =>
        expect(this.container.get('arrayParam')).to.eventually.property('payload').deep.equal(value).notify(done)

  describe 'Collection.', ->
    beforeEach ->
      memory = new Memory({});
      this.testSchema = testSchema(memory)
      this.mold = mold.initSchema( {}, this.testSchema )
      this.container = this.mold.instance('commonBranch.inMemory')
      this.collection = this.mold.instance('commonBranch.inMemory.collection')

    it 'add', ->
      promise = this.collection.add({name: 'name3'})
      expect(promise).to.eventually.property('payload').deep.equal({ name: 'name3', id: 0 })


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




