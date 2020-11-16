const _ = require('lodash');
const Memory = require('./drivers/Memory');
const { eachSchema, getTheBestMatchPath } = require('./helpers/helpers');


module.exports = class DriverManager {
  constructor(main) {
    this._main = main;
    this.$defaultMemoryDb = {};
    this._drivers = {};
    this._defaultDriver = null;
  }

  init() {
    this._initDefaultDriver();
  }

  collectDrivers(fullSchema) {
    eachSchema(fullSchema, (moldPath, schemaPath, schema) => {
      // find only driver or container node
      if (schema.type !== 'driver' && schema.type !== 'container') return;

      if (!schema.driver) return;

      // init driver if it has set
      if (this.isRegistered(moldPath)) return;

      const upperDriverMoldPath = this.getClosestDriverPath(moldPath);

      if (upperDriverMoldPath && upperDriverMoldPath !== moldPath) {
        this._main.log.fatal(`You can't specify more than one driver to one branch of schema!`);
      }

      this._registerDriver(moldPath, schema.driver);
    });
  }

  getDefaultDriver() {
    return this._defaultDriver;
  }

  isRegistered(moldPath) {
    return Boolean(this._drivers[moldPath]);
  }

  /**
   * Get driver on path or upper on path.
   * It no one driver has found it returns defaultDriver (memory)
   * @param {string} moldPath - path in your schema.
   * @returns {object|undefined} driver.
   */
  getDriver(moldPath) {
    const driverRoot = this.getClosestDriverPath(moldPath);
    const driver = this.getDriverStrict(driverRoot);

    if (driver) return driver;

    // else return default memory driver
    return this._defaultDriver;
  }

  /**
   * Get driver by path.
   * @param {string} moldPath - path in your schema.
   *   If driverPath doesn't specified or '' it means defautl memory driver
   * @returns {object|undefined} If driver doesn't exists, returns undefined
   */
  getDriverStrict(moldPath) {
    if (moldPath) return this._drivers[moldPath];

    // if not driverPath it means default memory driver
    return this._defaultDriver;
  }

  /**
   * Return driver path which is driver specified on schema.
   * @param {string} moldPath - path in your schema.
   * @returns {string|undefined} real driver path
   */
  getClosestDriverPath(moldPath) {
    if (!_.isString(moldPath)) this._main.log.fatal(`You must pass the moldPath argument!`);

    return getTheBestMatchPath(moldPath, _.keys(this._drivers));
  }

  _registerDriver(moldPath, driver) {
    // initialize a driver
    driver.init(moldPath, this._main);
    // save it
    this._drivers[moldPath] = driver;
  }

  _initDefaultDriver() {
    const memoryDriver = new Memory({ db: this.$defaultMemoryDb });

    this._defaultDriver = memoryDriver.instance({});
  }
};
