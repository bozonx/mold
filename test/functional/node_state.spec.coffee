mold = require('../../src/index').default

# TODO: валидация при update
# TODO: clear
# TODO: events

describe 'Functional. State node.', ->
  beforeEach () ->
    testSchema = () ->
      container:
        state: {
          type: 'state'
          schema: {
            boolParam: {type: 'boolean'}
            stringParam: {type: 'string'}
            numberParam: {type: 'number'}
            arrayParam: {
              type: 'array'
              itemsType: 'number'
            }
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
    assert.deepEqual(@state.mold, {})

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

  it "set all types of data", ->
    partialData = {
      boolParam: true
      stringParam: 'value'
      numberParam: 5
      arrayParam: [1,2]
      nested: {
        item1: 'value1'
      }
    }
    @state.update(partialData)

    assert.deepEqual(@state.mold, partialData)

  it "update partly", ->
    @state.update({
      stringParam: 'newerValue',
      numberParam: 5,
    })
    @state.update({
      boolParam: true,
      numberParam: 6,
    })

    assert.deepEqual(@state.mold, {
      stringParam: 'newerValue',
      numberParam: 6,
      boolParam: true,
    })

  it "update silent", ->
    @mold.$$storage.updateTopLevelSilent = sinon.spy()

    @state.updateSilent({ param: 'value' })

    sinon.assert.calledOnce(@mold.$$storage.updateTopLevelSilent)

#  it "clear()", ->
#    this.container.update({
#      stringParam: 'newValue',
#      numberParam: 5,
#    })
#    this.container.clear();
#    assert.deepEqual(this.container.mold, {})
