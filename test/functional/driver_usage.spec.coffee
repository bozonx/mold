mold = require('../../src/index')
LocalStorage = require('../../src/drivers/LocalStorage').default

# TODO: можно задавать несколько инстансов с разными локальными конфигами
# TODO: можно делать вложенные инстансы с разными конфигами

testSchema = (localStorage) ->
  commonBranch:
    inLocalStorage: localStorage.schema({}, {
      param1: {type: 'string'}
    })

describe 'Functional. Driver usage.', ->
  beforeEach ->
    localStorage = new LocalStorage({});
    this.testSchema = testSchema(localStorage)
    this.mold = mold.initSchema( {}, this.testSchema )
    this.localStorageInstance = this.mold.instance('commonBranch.inLocalStorage')

  it 'Schema must be without drivers', ->
    assert.equal(this.mold.schemaManager.get('commonBranch.inLocalStorage.param1'),
      this.testSchema.commonBranch.inLocalStorage.schema.param1)

  it 'get driver from schema', ->
    # TODO: Don't use private
    driver = this.mold.schemaManager.getDriver('commonBranch.inLocalStorage')
    assert.equal(driver.constructor.name, 'LocalLocalStorage')
    assert.equal(driver.root, 'commonBranch.inLocalStorage')

    driverFromDeep = this.mold.schemaManager.getDriver('commonBranch.inLocalStorage.param1')
    assert.equal(driverFromDeep.constructor.name, 'LocalLocalStorage')
    assert.equal(driverFromDeep.root, 'commonBranch.inLocalStorage')
