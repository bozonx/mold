mold = require('../../src/index').default
Mold = require('../../src/Mold').default

# TODO: test initial values which is specified in schema 'initial'
# TODO: test don't update read only props

describe.only 'Functional. Mold.', ->
  describe 'assoc.', ->
    beforeEach () ->
      @fullSchema = {
        type: 'assoc'
        items: {
          numberParam: { type: 'number' }
        }
      }
      @moldPath = 'state'
      @main = mold( {silent: true}, {} )
      @moldInstance = new Mold(@main, @moldPath, 'default', @fullSchema);
      @moldInstance.init()

    it "init", ->
      assert.deepEqual(@moldInstance.state, {
        numberParam: undefined
      })

    it "update - it has to cast before update", ->
      @moldInstance.update({ numberParam: '5' });
      assert.deepEqual(@moldInstance.state, {
        numberParam: 5
      })

    it "updateSilent - it has to cast before update", ->
      @moldInstance.updateSilent({ numberParam: '5' });
      assert.deepEqual(@moldInstance.state, {
        numberParam: 5
      })

# TODO: test initial state for collection

  describe 'collection.', ->
    beforeEach () ->
      @testSchema = {
        type: 'collection'
        item: {
          numberParam: { type: 'number' }
        }
      }
      @moldPath = 'collection'
      @main = mold( {silent: true}, {} )
      @moldInstance = new Mold(@main, @moldPath, 'default', @fullSchema);
      @moldInstance.init()

    it "init", ->
      assert.deepEqual(@moldInstance.state, [])
