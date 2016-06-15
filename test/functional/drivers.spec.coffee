_ = require('lodash');

mold = require('../../src/index')

# TODO: можно задавать несколько инстансов с разными локальными конфигами
# TODO: можно делать вложенные инстансы с разными конфигами

class LocalTestDriver
  constructor: (mainInstatnce, localConfig) ->
    this._mainInstatnce = mainInstatnce
    this._localConfig = localConfig
    # memory storage for test
    this.__storage = {}

  init: (root, schemaManager, state, events) ->
    this.root = root;
    this._schemaManager = schemaManager;
    this._state = state;
    this._events = events;

  requestHandler: (event, next, error) ->
    _.set(this.__storage, event.path, event.requestValue);
    next(event);


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

  it 'set data via driver requestHandler by running state.setSilent()', ->
    this.mold.state.setSilent('commonBranch.inTestDriver.param1', 'new value')
    driver = this.mold.schemaManager.getDriver('commonBranch.inTestDriver')

    assert.equal(this.mold.state.getComposition('commonBranch.inTestDriver.param1'), 'new value')
    # TODO: должен ли быть такой длинный путь у драйвера????
    assert.equal(_.get(driver.__storage, 'commonBranch.inTestDriver.param1'), 'new value')

  it 'check promise', () ->
    promise = this.mold.state.setSilent('commonBranch.inTestDriver.param1', 'new value')
    expect(promise).to.eventually.deep.equal({type: 'set', path: 'commonBranch.inTestDriver.param1', requestValue: 'new value'})

  # TODO: check error in middleware
