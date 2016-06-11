mold = require('../../src/index')
LocalStorage = require('../../src/drivers/LocalStorage').default

# TODO: можно задавать несколько инстансов с разными локальными конфигами
# TODO: можно делать вложенные инстансы с разными конфигами

testSchema = (localStorage) ->
  commonBranch:
    inLocalStorage: localStorage.schema({}, {
      param1: {type: 'string'}
    })

describe 'Functional. PounchDb driver.', ->
  beforeEach ->
    localStorage = new LocalStorage({});
    this.testSchema = testSchema(localStorage)
    this.state = mold.initSchema( this.testSchema )
    this.localStorageInstance = this.state.instance('commonBranch.inLocalStorage')

  it 'Schema must be without drivers', ->
    assert.equal(this.state._schemaManager.get('commonBranch.inLocalStorage.param1'),
      this.testSchema.commonBranch.inLocalStorage.schema.param1)

  it 'get driver from schema', ->
    # TODO: Don't use private
    driver = this.state._schemaManager.getDriver('commonBranch.inLocalStorage')
    assert.equal(driver.constructor.name, 'LocalLocalStorage')
    assert.equal(driver.root, 'commonBranch.inLocalStorage')

    driverFromDeep = this.state._schemaManager.getDriver('commonBranch.inLocalStorage.param1')
    assert.equal(driverFromDeep.constructor.name, 'LocalLocalStorage')
    assert.equal(driverFromDeep.root, 'commonBranch.inLocalStorage')
