import Composition from './Composition';
import SchemaManager from './SchemaManager';
import State from './State';
import Config from './Config';

export default class Main {
  constructor(config, schema) {
    var configInstance = new Config(config);
    this.config = configInstance.get();
    this.events = this.config.eventEmitter;

    this._composition = new Composition(this.events);
    this.schemaManager = new SchemaManager();
    this.state = new State();

    this.schemaManager.init(schema, this);
    this.state.init(this, this._composition);
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
