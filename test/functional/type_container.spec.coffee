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
    this.container = this.mold.child('container')

  it "Initial values", ->
    assert.deepEqual(this.container.mold, {
      arrayParam: [],
      nested: {}
    })

  it "child(subpath)", ->
    nested = this.container.child('nested')
    nested.update({nestedStringParam: 'newValue'})
    assert.equal(nested.root, 'container.nested')
    assert.deepEqual(nested.mold, {nestedStringParam: 'newValue'})

  it "update()", ->
    this.container.update(this.testValues)
    this.container.update({stringParam: 'newerValue'})
    assert.deepEqual(this.container.mold, _.defaultsDeep({stringParam: 'newerValue'}, this.testValues))

  it "update() partly", ->
    this.container.update({
      stringParam: 'newerValue',
      numberParam: 5,
    })
    this.container.update({
      boolParam: true,
      numberParam: 6,
    })
    assert.deepEqual(this.container.mold, {
      stringParam: 'newerValue',
      numberParam: 6,
      boolParam: true,
      arrayParam: [],
      nested: {}
    })
