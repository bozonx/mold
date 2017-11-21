mold = require('../../src/index').default

describe.only 'Functional. Container type.', ->
  beforeEach () ->
    testSchema = () ->
      container:
        containerInner:
          state:
            type: 'state'

    @testSchema = testSchema()
    @mold = mold( {silent: true}, @testSchema )

  it "container has to have only other containers, state, document or Catalogue as a child", ->
    # TODO: !!!!

  it "Try to get container - it throws an error", ->
    expect(() => @mold.get('container.containerInner')).to.throw('You can\'t get instance of simple container on path "container.containerInner"')

  it "Get state type via containers", ->
    state = @mold.get('container.containerInner.state')
    expect(state.type).to.be.equal('state')

#
#  beforeEach () ->
#    testSchema = () ->
#      container:
#        type: 'container'
#        schema:
#          boolParam: { type: 'boolean' }
#          stringParam: { type: 'string'}
#          numberParam: { type: 'number' }
#          arrayParam: { type: 'array' }
#          nested:
#            type: 'container'
#            schema:
#              nestedStringParam:
#                type: 'string'
#
#    this.testValues = {
#      boolParam: true,
#      stringParam: 'newValue',
#      numberParam: 5,
#      arrayParam: ['value1'],
#      nested:
#        nestedStringParam: 'nestedValue'
#    }
#
#    this.testSchema = testSchema()
#    this.mold = mold( {silent: true}, this.testSchema )
#    this.container = this.mold.child('container')
#
#  it "Initial values", ->
#    assert.deepEqual(this.container.mold, {})
#
#  it "child(subpath)", ->
#    nested = this.container.child('nested')
#    nested.update({nestedStringParam: 'newValue'})
#    assert.equal(nested.root, 'container.nested')
#    assert.deepEqual(nested.mold, {nestedStringParam: 'newValue'})
#
#  it "update()", ->
#    this.container.update(this.testValues)
#    this.container.update({stringParam: 'newerValue'})
#    assert.deepEqual(this.container.mold, _.defaultsDeep({stringParam: 'newerValue'}, this.testValues))
#
#  it "update() partly", ->
#    this.container.update({
#      stringParam: 'newerValue',
#      numberParam: 5,
#    })
#    this.container.update({
#      boolParam: true,
#      numberParam: 6,
#    })
#    assert.deepEqual(this.container.mold, {
#      stringParam: 'newerValue',
#      numberParam: 6,
#      boolParam: true,
#    })
#
#  it "clear()", ->
#    this.container.update({
#      stringParam: 'newValue',
#      numberParam: 5,
#    })
#    this.container.clear();
#    assert.deepEqual(this.container.mold, {})
