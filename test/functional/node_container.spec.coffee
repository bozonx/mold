mold = require('../../src/index').default

describe 'Functional. Container node.', ->
  beforeEach () ->
    testSchema = () ->
      container:
        containerInner:
          state:
            type: 'state'
            schema: {}

    @testSchema = testSchema()
    @mold = mold( {silent: true}, @testSchema )

  it "container has to have only other containers, state, document or Catalogue as a child", ->
    # TODO: !!!!

  it "Try to get container - it throws an error", ->
    expect(() => @mold.get('container.containerInner')).to.throw('You can\'t get instance of simple container node on path "container.containerInner"')

  it "Get state type via containers", ->
    state = @mold.get('container.containerInner.state')
    expect(state.type).to.be.equal('state')
