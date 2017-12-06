mold = require('../../src/index').default

describe 'Functional. Mold.', ->
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
    #@moldInstance = new Mold(@mold, @moldPath, 'default', )
    @moldInstance = @mold.get(@moldPath).actions.default

  it "init", ->
    assert.deepEqual(@moldInstance.state, {
      stringParam: undefined
      collection: []
    })

# TODO: test initial values which is specified in schema 'initial'
# TODO: test don't update read only props
# TODO: validate before update - it throws an error
