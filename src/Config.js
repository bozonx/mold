import Memory from './drivers/Memory';

export default class Config {
  constructor(conf) {
    this._config = conf;

    this._initMemoryDriver();
    this._initEvents();

    // TODO: validate a config
  }

  get() {
    // TODO: immutable????
    return this._config;
  }

  _initMemoryDriver() {
    if (!this._config.memoryDriver) {
      this._config.memoryDriver = new Memory({
        db: {},
      });
    }
  }

  _initEvents() {
    if (!this._config.events) {
      // TODO: один фиг он подгрузится в сборку
      var EventEmitter2 = require('eventemitter2').EventEmitter2;

      this._config.events = new EventEmitter2({

        //
        // set this to `true` to use wildcards. It defaults to `false`.
        //
        wildcard: true,

        //
        // the delimiter used to segment namespaces, defaults to `.`.
        //
        //delimiter: '::',

        //
        // set this to `true` if you want to emit the newListener event. The default value is `true`.
        //
        //newListener: false,

        //
        // the maximum amount of listeners that can be assigned to an event, default 10.
        //
        maxListeners: 2000
      });
    }
  }
}
