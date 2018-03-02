mold = require('../../src/index')
State = require('../../src/nodes/State')


describe 'Functional. State node.', ->
  beforeEach () ->
    testSchema = () ->
      container:
        state: {
          type: 'state'
          schema: {
            numberParam: {type: 'number'}
            nested: {
              type: 'assoc'
              items: {
                nestedStringParam: {type: 'string'}
              }
            }
          }
        }

    @testSchema = testSchema()
    @moldPath = 'container.state'
    @mold = mold( @testSchema, {silent: true} )
    @state = @mold.get(@moldPath)
    @state.$init(@moldPath, @testSchema.container.state)

  it "init", ->
    assert.deepEqual(@state.mold, {
      numberParam: undefined
      nested: {}
    })

  it "validate schema - node without schema", ->
    testSchema = {
      state: {
        type: 'state'
      }
    }

    assert.equal(
      State.validateSchema(testSchema.state, 'state'),
      'The definition of "state" node on "state" must has a "schema"!'
    )

  it "validate schema - schema with 'type' param", ->
    testSchema = {
      state: {
        type: 'state'
        schema: {
          type: 'string'
        }
      }
    }

    assert.equal(
      State.validateSchema(testSchema.state, 'state'),
      'Schema definition of "state" node on "state" must not to have a "type" param! It has to be just plain object.'
    )

  it "update", ->
    @state.update({
      numberParam: '5'
      nested: {
        nestedStringParam: 'value1'
      }
    })
    @state.update({
      nested: {
        nestedStringParam: 'value2'
      }
    })

    assert.deepEqual(@state.mold, {
      numberParam: 5
      nested: {
        nestedStringParam: 'value2'
      }
    })

  it "update silent", ->
    @state.actions.default.updateSilent = sinon.spy()

    data = { numberParam: 5 }
    @state.updateSilent({ numberParam: 5 })

    sinon.assert.calledOnce(@state.actions.default.updateSilent)
    sinon.assert.calledWith(@state.actions.default.updateSilent, data)

  it "events", ->
    # TODO: наверное это нужно делать не здесь
    handlerChange = sinon.spy()
    handlerAnyChange = sinon.spy()

    @state.onChange(handlerChange)
    @state.onAnyChange(handlerAnyChange)

    @state.update({ numberParam: 1 })
    @state.update({ numberParam: 2 })
    @state.off('change', handlerChange)
    @state.off('any', handlerAnyChange)
    @state.update({ numberParam: 3 })

    sinon.assert.calledThrice(handlerChange)
    sinon.assert.calledThrice(handlerAnyChange)


#  it "clear", ->
#    @state.update({
#      numberParam: 5
#      nested: {
#        nestedStringParam: 'value1'
#      }
#    })
#
#    @state.clear();
#
#    assert.deepEqual(@state.mold, {
#      numberParam: undefined
#      nested: {}
#    })
