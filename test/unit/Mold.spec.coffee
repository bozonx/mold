mold = require('../../src/index').default

# TODO: test initial values which is specified in schema 'initial'
# TODO: test don't update read only props

describe.only 'Functional. Mold.', ->
  describe 'assoc.', ->
    beforeEach () ->
      testSchema = () ->
        state: {
          type: 'state'
          schema: {
            numberParam: { type: 'number' }
          }
        }

      @testSchema = testSchema()
      @moldPath = 'state'
      @mold = mold( {silent: true}, @testSchema )
      @state = @mold.get(@moldPath)
      @moldInstance = @state.actions.default._mold

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


#  describe 'collection.', ->
#    beforeEach () ->
#      testSchema = () ->
#        collection: {
#          type: 'collection'
#          item: {
#            numberParam: { type: 'number' }
#          }
#        }
#
#      @testSchema = testSchema()
#      @moldPath = 'collection'
#      @mold = mold( {silent: true}, @testSchema )
#      @state = @mold.get(@moldPath)
#      @moldInstance = @state.actions.default._mold
#
#    it "init", ->
#      assert.deepEqual(@moldInstance.state, [])


