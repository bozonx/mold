mold = require('../../src/index').default

describe.only 'Functional. Mold.', ->
  describe 'assoc.', ->
    beforeEach () ->
      testSchema = () ->
        state: {
          type: 'state'
          schema: {
            stringParam: { type: 'string' }
            collection: { type: 'collection' }
          }
        }

      @testSchema = testSchema()
      @moldPath = 'state'
      @mold = mold( {silent: true}, @testSchema )
      @state = @mold.get(@moldPath)
      @moldInstance = @state.actions.default._mold

    it "init", ->
      assert.deepEqual(@moldInstance.state, {
        stringParam: undefined
        collection: []
      })

# TODO: test initial state for collection
# TODO: test initial values which is specified in schema 'initial'
# TODO: test don't update read only props


#  describe 'collection.', ->
#    beforeEach () ->
#      testSchema = () ->
#        collection: {
#          type: 'collection'
#          item: {
#            stringParam: { type: 'string' }
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


