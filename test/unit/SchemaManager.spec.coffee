mold = require('../../src/index').default


describe 'Unit. SchemaManager.', ->
  beforeEach () ->
    testSchema = () ->
      {
        container: {
          type: 'container'
          schema: {
            container: {
              state: {
                type: 'state'
                schema: {
                  stringParam: {type: 'string'}
                }
              }
            }
          }
        }
      }

    @testSchema = testSchema()
    @mold = mold( {silent: true}, this.testSchema )

  it "setSchema - check short containers", ->
    @mold.$$nodeManager.validateSchema = sinon.spy()
    @mold.$$typeManager.validateSchema = sinon.spy()

    testSchema = {
      container: {
        childContainer: {
          catalogue: {
            type: 'catalogue'
            item: {
              stringParam: {type: 'string'}
            }
          }
        }
      }
    }

    assert.doesNotThrow(() => @mold.$$schemaManager.setSchema(testSchema))

    assert.deepEqual(@mold.$$schemaManager.getFullSchema(), {
      container: {
        type: 'container'
        schema: {
          childContainer: {
            type: 'container'
            schema: {
              catalogue: {
                type: 'catalogue'
                item: {
                  stringParam: {type: 'string'}
                }
              }
            }
          }
        }
      }
    })

    sinon.assert.calledThrice(@mold.$$nodeManager.validateSchema)
    sinon.assert.calledOnce(@mold.$$typeManager.validateSchema)

  it "set schema to not root", ->
    newNode = {
      type: 'state'
      schema: {
      }
    }

    result = {
      "container": {
        "schema": {
          "container": {
            "schema": {
              "newSchema": {
                "schema": {}
                "type": "state"
              }
              "state": {
                "schema": {
                  "stringParam": {
                    "type": "string"
                  }
                }
                "type": "state"
              }
            }
            "type": "container"
          }
        }
        "type": "container"
      }
    }

    @mold.$$schemaManager.setSchema(@testSchema)
    assert.doesNotThrow(() => @mold.$$schemaManager.setNode('container.container.newSchema', newNode))

    assert.deepEqual(@mold.$$schemaManager.getFullSchema(), result)
    assert.deepEqual(@mold.$$schemaManager.getSchema('container.container.newSchema'), newNode)

  it "bad schema - node isn't registered", ->
    testSchema = {
      param: {
        type: 'another'
      }
    }

    assert.throws(
      () => @mold.$$schemaManager.setSchema(testSchema),
      "Unknown schema node or primitive {\"type\":\"another\"} !"
    )
