mold = require('../../src/index').default

describe 'Functional. Container type.', ->
  beforeEach () ->
    testSchema = () ->
      container:
        type: 'container'
        schema:
          boolParam: { type: 'boolean' }
          stringParam: { type: 'string'}
          numberParam: { type: 'number' }
          arrayParam: { type: 'array' }
          nested:
            type: 'container'
            schema:
              nestedStringParam:
                type: 'string'

    this.testValues = {
      boolParam: true,
      stringParam: 'newValue',
      numberParam: 5,
      arrayParam: ['value1'],
      nested:
        nestedStringParam: 'nestedValue'
    }

    this.testSchema = testSchema()
    this.mold = mold( {}, this.testSchema )
    this.container = this.mold.instance('container')

  it "Initial values", ->
    assert.deepEqual(this.container.mold, {
      boolParam: null,
      stringParam: null,
      numberParam: null,
      arrayParam: [],
      nested:
        nestedStringParam: null
    })

  it "child(subpath)", ->
    nested = this.container.child('nested')
    assert.equal(nested.root, 'container.nested')
    assert.deepEqual(nested.mold, {nestedStringParam: null})

  it "setMold()", ->
    this.container.setMold(this.testValues)
    this.container.setMold({stringParam: 'newerValue'})
    assert.deepEqual(this.container.mold, _.defaultsDeep({stringParam: 'newerValue'}, this.testValues))
