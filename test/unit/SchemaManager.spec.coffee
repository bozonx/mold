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

  it "setSchema", ->
