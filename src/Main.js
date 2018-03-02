import _ from 'lodash';

const Storage = require('./Storage');
const TypeManager = require('./TypeManager');
const SchemaManager = require('./SchemaManager');
const NodeManager = require('./NodeManager');
const DriverManager = require('./DriverManager');
const Request = require('./Request');
const defaultConfig = require('./defaultConfig');

const Container = require('./nodes/Container');
const Driver = require('./nodes/Driver');
const StateType = require('./nodes/State');
const Document = require('./nodes/Document');
const Catalogue = require('./nodes/Catalogue');


module.exports = class Main {
  constructor(schema, givenCconfig) {
    this.config = this._mergeConfig(givenCconfig);
    this.log = this._getLogger(this.config.logger);
    this.request = new Request(this);
    this.nodeManager = new NodeManager(this);
    this.driverManager = new DriverManager(this);
    this.typeManager = new TypeManager(this);
    this.schemaManager = new SchemaManager(this);
    this.storage = new Storage(this.log);

    this._init(schema);
  }

  _init(schema) {
    // register base types
    this.nodeManager.register('container', Container);
    this.nodeManager.register('driver', Driver);
    this.nodeManager.register('state', StateType);
    this.nodeManager.register('document', Document);
    this.nodeManager.register('catalogue', Catalogue);

    // TODO: run plugins

    // initialize
    this.driverManager.init();
    this.schemaManager.init();
    this.schemaManager.setSchema(schema);
    this.storage.$init();
  }

  _mergeConfig(givenCconfig) {
    return _.defaultsDeep({ ...givenCconfig }, defaultConfig);
  }

  _getLogger(externalLogger) {
    let logger = externalLogger;

    if (!externalLogger) {
      // use default logger
      const DefaultLoger = require('./DefaultLoger');
      logger = new DefaultLoger({ silent: this.config.silent });
    }

    return logger;
  }

};
