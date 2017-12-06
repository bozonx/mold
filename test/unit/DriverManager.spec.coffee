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

    sinon.assert.calledOnce(@driver.init)
    sinon.assert.calledWith(@driver.init, 'driverRoot', @main)

    assert.deepEqual(@driverManager._drivers, {
      'driverRoot': @driver
    })

  it "don't register driver twice", ->
    @driverManager.collectDrivers(@testSchema)
    @driverManager.collectDrivers(@testSchema)

    sinon.assert.calledOnce(@driver.init)
