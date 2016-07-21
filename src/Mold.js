import Composition from './Composition';
import SchemaManager from './SchemaManager';
import State from './State';
import Config from './Config';

export default class Mold {
  constructor(config, schema) {
    this._composition = new Composition(this);

    var configInstance = new Config(config);
    this.config = configInstance.get();
    this.events = this.config.eventEmitter;

    this.schemaManager = new SchemaManager();
    this.state = new State();

    this.schemaManager.init(schema, this);
    this.state.init(this, this._composition);
  }

  /**
   * Set all initial values. Work mode:
   *    initState(value) - pass values to root
   *    initState(path, value) - pass values to path
   * It silently setup a state.
   */
  // initState(param1, param2) {
  //   // TODO: !!!!! не нужно !!!! это делается через memory
  //  
  //   var path = param1;
  //   var value = param2;
  //   if (!param2) {
  //     path = '';
  //     value = param1;
  //   }
  //   return this.state.setSilent(path, value);
  // }

  // /**
  //  * Is param exists on a path
  //  * It just check schema.
  //  * @param {string} path - path relative to instance root
  //  * @returns {boolean}
  //  */
  // has(path) {
  //   if (!path)
  //     throw new Error(`You must pass a path argument.`);
  //   return this._main.schemaManager.has(this._fullPath(path));
  // }

  /**
   * Get instance of one of the types by a path
   * @param {string} path - absolute path
   * @returns {object} - instance of one of the types
   */
  instance(path) {
    return this.schemaManager.getInstance(path);
  }
}
