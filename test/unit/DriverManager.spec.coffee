DriverManager = require('../../src/DriverManager').default


describe 'Unit. DriverManager.', ->
  beforeEach () ->
    @main = {
      $$log: { fatal: sinon.spy() }
    }

    @driver = {
      init: sinon.spy()
    }

    testSchema = () =>
      {
        driverRoot: {
          type: 'driver'
          driver: @driver
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
      'driverRoot': @driver
    })
