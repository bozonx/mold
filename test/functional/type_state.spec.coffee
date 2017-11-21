mold = require('../../src/index').default

describe.only 'Functional. State type.', ->
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
            collection: {
              type: 'collection'
              item: {
                id: { type: 'number', key: true }
                itemStringParam: {type: 'string'}
              }
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
    @state = this.mold.get(@moldPath)
    @state.$init(@moldPath, @testSchema.container.state)

  it "init", ->
    assert.deepEqual(@state.mold, {})

  # TODO: check schema - все внутренние sub types

  it "update", ->
    partialData = {
      boolParam: true
      stringParam: 'value'
      numberParam: 5
      arrayParam: [1,2]
      # TODO: !!! collection
      # TODO: !!! nested
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
    @mold.$$stateManager.updateTopLevelSilent = sinon.spy()

    @state.updateSilent({ param: 'value' })

    sinon.assert.calledOnce(@mold.$$stateManager.updateTopLevelSilent)


  # TODO: валидация при update не верных параметров

#  it "clear()", ->
#    this.container.update({
#      stringParam: 'newValue',
#      numberParam: 5,
#    })
#    this.container.clear();
#    assert.deepEqual(this.container.mold, {})
