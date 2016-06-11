import Composition from './Composition';
import SchemaManager from './SchemaManager';
import State from './State';

export default class MainInstance {
  constructor(config, schema) {
    this._composition = new Composition();
    this.config = config;
    
    // TODO: validate a config
    
    // TODO: ругаться если не передан
    this.events = config.eventEmitter;
    this.schemaManager = new SchemaManager();
    this.state = new State();

    this.schemaManager.init(schema, this);
    this.state.init(this, this._composition);
  }

  /**
   * Get all current runtime state
   * @param {string} path - path to a state. To get root, pass ''
   * @returns {object} state
   */
  getState(path) {
    return this.state.getValue(path);
  }

  /**
   * Set all initial values. Work mode:
   *    setSilent(value) - pass values to root
   *    setSilent(path, value) - pass values to path
   * It silently setup a state.
   */
  initState(param1, param2) {
    var path = param1;
    var value = param2;
    if (!param2) {
      path = '';
      value = param1;
    }
    this.state.setSilent(path, value);
  }

  /**
   * Get list or item or container instance by a path
   * @param {string} path - absolute path
   * @returns {object} - instance of param or list or container
   */
  instance(path) {
    return this.schemaManager.getInstance(path);
  }
}
