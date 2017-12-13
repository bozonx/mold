mold = require('../../src/index').default

# TODO: clear
# TODO: events
# TODO: destroy

describe.only 'Functional. State node.', ->
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
    @mold = mold( {silent: true}, @testSchema )
    @state = @mold.get(@moldPath)
    @state.$init(@moldPath, @testSchema.container.state)

  it "init", ->
    assert.deepEqual(@state.mold, {
      numberParam: undefined
      nested: {}
    })

  it "validate schema - node without schema param", ->
    testSchema = {
      container: {
        type: 'container'
      }
    }

    assert.throws(
      () => mold( {silent: true}, testSchema ),
      'Schema definition of container on "container" must has a "schema" param!'
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
    handlerChange = sinon.spy()
    handlerAnyChange = sinon.spy()

    @state.onChange(handlerChange)
    @state.onAnyChange(handlerAnyChange)

    @state.update({ numberParam: 1 })
    @state.update({ numberParam: 2 })
    @state.off('change', handlerChange)
    @state.off('any', handlerAnyChange)
    @state.update({ numberParam: 3 })

    sinon.assert.calledTwice(handlerChange)
    sinon.assert.calledTwice(handlerAnyChange)


#  it "clear()", ->
#    this.container.update({
#      stringParam: 'newValue',
#      numberParam: 5,
#    })
#    this.container.clear();
#    assert.deepEqual(this.container.mold, {})
