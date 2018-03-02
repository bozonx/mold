import _ from 'lodash';


module.exports = class Container {
  static validateSchema(schema, schemaPath) {
    if (!_.isPlainObject(schema.schema)) {
      return `Schema definition of container on "${schemaPath}" must has a "schema" param!`;
    }
  }

  constructor(main) {
    this._main = main;
  }

  get type() {
    return 'container';
  }

  $init(moldPath, schema) {
    this._main.log.fatal(`You can't get instance of simple container node on path "${moldPath}"`);
  }

};
