DriverManager = require('../../src/DriverManager').default


describe 'Unit. DriverManager.', ->
  beforeEach () ->
    @main = {
      $$log: { fatal: sinon.spy() }
    }

    testSchema = () ->
      {
        driverRoot: {
          type: 'driver'
          driver: 'memory'
          schema: {
#            container: {
#              state: {
#                type: 'state'
#                schema: {
#                  stringParam: {type: 'string'}
#                }
#              }
#            }
          }
        }
      }

    @testSchema = testSchema()
    @driverManager = new DriverManager(@main);

  it "collect drivers", ->
    @driverManager.collectDrivers(@testSchema)

    assert.deepEqual(@driverManager._drivers, {
      'driverRoot': {}
    })
