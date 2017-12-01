SchemaManager = require('../../src/SchemaManager').default


describe 'Unit. SchemaManager.', ->
  beforeEach () ->
    @main = {
      $$log: { fatal: sinon.spy() }
    }

    testSchema = () ->
      {
        driverRoot: {
          type: 'driver'
          driver: 'testDriver'
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
    @schemaManager = new SchemaManager(@main);

  it "setSchema - check short containers", ->
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

    assert.doesNotThrow(() => @schemaManager.setSchema('', testSchema))

    assert.deepEqual(@schemaManager.getFullSchema(), {
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

  # TODO: check bad schema - assert.throws()
  # TODO: test set schema to not root
  # TODO: getting driver from schema
