export default class Config {
  constructor(conf) {
    this._config = conf;

    this._initEvents();

    // TODO: validate a config
  }

  get() {
    return this._config;
  }

  _initEvents() {
    if (!this._config.eventEmitter) {
      // TODO: один фиг он подгрузится в сборку
      var EventEmitter2 = require('eventemitter2').EventEmitter2;

      this._config.eventEmitter = new EventEmitter2({

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
