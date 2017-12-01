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
          state: {
            type: 'state'
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
              state: {
                type: 'state'
              }
            }
          }
        }
      }
    })

  # TODO: check bad schema - assert.throws()
  # TODO: test set schema to not root
  # TODO: getting driver from schema
