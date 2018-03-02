const _ = require('lodash');


module.exports = class Driver {
  static validateSchema(schema, schemaPath) {
    if (!_.isPlainObject(schema.schema)) {
      return `Schema definition of container on "${schemaPath}" must has a "schema" param!`;
    }
  }

  constructor(main) {
    this._main = main;
  }

  get type() {
    return 'driver';
  }

  $init(moldPath, schema) {
    this._main.log.fatal(`You can't get instance of driver node on path "${moldPath}"`);
  }

};
