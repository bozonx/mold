mold = require('../../src/index')


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
    @mold = mold( this.testSchema, {silent: true} )

  it "setSchema - check short containers", ->
    @mold.$main.nodeManager.validateSchema = sinon.spy()
    @mold.$main.typeManager.validateSchema = sinon.spy()

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

    assert.doesNotThrow(() => @mold.$main.schemaManager.setSchema(testSchema))

    assert.deepEqual(@mold.$main.schemaManager.getFullSchema(), {
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

    sinon.assert.calledThrice(@mold.$main.nodeManager.validateSchema)
    sinon.assert.calledOnce(@mold.$main.typeManager.validateSchema)

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

    @mold.$main.schemaManager.setSchema(@testSchema)
    assert.doesNotThrow(() => @mold.$main.schemaManager.setNode('container.container.newSchema', newNode))

    assert.deepEqual(@mold.$main.schemaManager.getFullSchema(), result)
    assert.deepEqual(@mold.$main.schemaManager.getSchema('container.container.newSchema'), newNode)

  it "bad schema - node isn't registered", ->
    testSchema = {
      param: {
        type: 'another'
      }
    }

    assert.throws(
      () => @mold.$main.schemaManager.setSchema(testSchema),
      "Unknown schema node or primitive {\"type\":\"another\"} !"
    )
