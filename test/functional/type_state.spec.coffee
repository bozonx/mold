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
    @mold = mold( {silent: true}, @testSchema )
    @state = this.mold.get('container.state')

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


  # TODO: валидация при update не верных параметров


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
