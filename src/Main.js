import Storage from './Storage';
import SchemaManager from './SchemaManager';
import State from './State';
import Config from './Config';
import Log from './Log';

export default class Main {
  constructor(config, schema) {
    var configInstance = new Config(config);
    this.config = configInstance.get();
    this.events = this.config.eventEmitter;
    this.log = new Log({silent: this.config.silent});

    this._storage = new Storage(this.events);
    this.schemaManager = new SchemaManager();
    this.state = new State();

    // initialize
    this.schemaManager.init(schema, this);
    this.state.init(this, this._storage);
  }

  /**
   * Get instance of one of the types by a path
   * @param {string} path - absolute path
   * @returns {object} - instance of one of the types
   */
  instance(path) {
    return this.schemaManager.getInstance(path);
  }

  onMoldUpdate(handler) {
    this.state.onMoldUpdate(handler);
  }

  offMoldUpdate(handler) {
    this.state.offMoldUpdate(handler);
  }
}
