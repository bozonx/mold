import _ from 'lodash';

import Memory from './drivers/Memory';
import { eachSchema, getTheBestMatchPath } from './helpers/helpers';


export default class DriverManager {
  constructor(main) {
    this._main = main;
    this.$defaultMemoryDb = {};
    this._drivers = {};
    this._defaultDriver = null;
  }

  initDefaultDriver() {
    const memoryDriver = new Memory({
      db: this.$defaultMemoryDb,
    });
    this._defaultDriver = memoryDriver.instance({});
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
        this._main.$$log.fatal(`ERROR: you can't specify more than one driver to one branch of schema!`);
      }

      schema.driver.init(moldPath, this._main);
      this.registerDriver(moldPath, schema.driver);
    });
  }

  getDefaultDriver() {
    return this._defaultDriver;
  }

  isRegistered(moldPath) {
    return !!this._drivers[moldPath];
  }

  registerDriver(moldPath, driver) {
    this._drivers[moldPath] = driver;
  }

  /**
   * Get driver on path or upper on path.
   * It no one driver has found it returns defaultDriver (memory)
   * @param pathInSchema
   * @return {Object|undefined}
   */
  getDriver(pathInSchema) {
    // TODO: use mold path
    const driverRoot = this.getClosestDriverPath(pathInSchema);
    const driver = this.getDriverStrict(driverRoot);

    if (driver) return driver;

    // else return default memory driver
    return this._defaultDriver;
  }

  /**
   * Get driver by path.
   * @param {string} driverPath - absolute path to driver.
   *   If driverPath doesn't specified or '' it means defautl memory driver
   * @returns {object|undefined} If driver doesn't exists, returns undefined
   */
  getDriverStrict(driverPath) {
    // TODO: use mold path
    if (driverPath) return this._drivers[driverPath];

    // if not driverPath it means default memory driver
    return this._defaultDriver;
  }

  /**
   * Return driver path which is driver specified on schema.
   * @param {string} moldPath
   * @return {string|undefined} real driver path
   */
  getClosestDriverPath(moldPath) {
    if (!_.isString(moldPath)) this._main.$$log.fatal(`You must pass the moldPath argument!`);

    return getTheBestMatchPath(moldPath, _.keys(this._drivers));
  }

}
