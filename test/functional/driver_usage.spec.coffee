mold = require('../../src/index')

# TODO: можно задавать несколько инстансов с разными локальными конфигами
# TODO: можно делать вложенные инстансы с разными конфигами

class LocalTestDriver
  constructor: (mainInstatnce, localConfig) ->
    this._mainInstatnce = mainInstatnce
    this._localConfig = localConfig

  init: (root, schemaManager, state, events) ->
    this.root = root;
    this._schemaManager = schemaManager;
    this._state = state;
    this._events = events;

    
class TestDriver
  constructor: (mainConfig) ->
    this.mainConfig = mainConfig

  schema: (localConfig, schema) ->
    driver: new LocalTestDriver(this, localConfig)
    schema: schema

    
    
testSchema = (localStorage) ->
  commonBranch:
    inTestDriver: localStorage.schema({}, {
      param1: {type: 'string'}
    })

describe 'Functional. Driver usage.', ->
  beforeEach ->
    localStorage = new TestDriver({});
    this.testSchema = testSchema(localStorage)
    this.mold = mold.initSchema( {}, this.testSchema )
    this.localStorageInstance = this.mold.instance('commonBranch.inTestDriver')

  it 'Schema must be without drivers', ->
    assert.equal(this.mold.schemaManager.get('commonBranch.inTestDriver.param1'),
      this.testSchema.commonBranch.inTestDriver.schema.param1)

  it 'get driver from schema', ->
    # TODO: Don't use private
    driver = this.mold.schemaManager.getDriver('commonBranch.inTestDriver')
    assert.equal(driver.constructor.name, 'LocalTestDriver')
    assert.equal(driver.root, 'commonBranch.inTestDriver')

    driverFromDeep = this.mold.schemaManager.getDriver('commonBranch.inTestDriver.param1')
    assert.equal(driverFromDeep.constructor.name, 'LocalTestDriver')
    assert.equal(driverFromDeep.root, 'commonBranch.inTestDriver')
