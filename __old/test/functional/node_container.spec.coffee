mold = require('../../src/index')

describe 'Functional. Container node.', ->
  beforeEach () ->
    testSchema = () ->
      container:
        containerInner:
          state:
            type: 'state'
            schema: {}

    @testSchema = testSchema()
    @mold = mold( @testSchema, {silent: true} )

  it "validate schema - node without schema param", ->
    testSchema = {
      container: {
        type: 'container'
      }
    }

    assert.throws(
      () => mold( testSchema, {silent: true} ),
      'Schema definition of container on "container" must has a "schema" param!'
    )

  it "container has to have only other containers, state, document or Catalogue as a child", ->
    # TODO: !!!!

  it "Try to get container - it throws an error", ->
    expect(() => @mold.get('container.containerInner')).to.throw('You can\'t get instance of simple container node on path "container.containerInner"')

  it "Get state type via containers", ->
    state = @mold.get('container.containerInner.state')
    expect(state.type).to.be.equal('state')
