import Composition from './Composition';
import SchemaManager from './SchemaManager';
import State from './State';

export default class MoldInstance {
  constructor(config, schema) {
    this._composition = new Composition();
    this.config = config;

    // TODO: validate a config

    // TODO: ругаться если не передан
    //this.events = config.eventEmitter;
    
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
  initState(param1, param2) {
    var path = param1;
    var value = param2;
    if (!param2) {
      path = '';
      value = param1;
    }
    return this.state.setSilent(path, value);
  }

  /**
   * Get instance of one of the types by a path
   * @param {string} path - absolute path
   * @returns {object} - instance of one of the types
   */
  instance(path) {
    return this.schemaManager.getInstance(path);
  }
}
