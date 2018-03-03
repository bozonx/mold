const _ = require('lodash');
const NodeBase = require('./_NodeBase');


module.exports = class State extends NodeBase {
  static validateSchema(schema, schemaPath) {
    if (!_.isPlainObject(schema.schema)) {
      return `The definition of "state" node on "${schemaPath}" must has a "schema"!`;
    }
    else if (schema.schema.type) {
      return `Schema definition of "state" node on "${schemaPath}" must not to have a "type" param! It has to be just plain object.`;
    }
  }

  get type() {
    return 'state';
  }

  $init(moldPath, schema) {
    // convert to simple schema type
    this.$fullSchema = this.$fullSchema || {
      type: 'assoc',
      items: schema.schema,
    };

    super.$init(moldPath, schema);
  }

  $generateDefaultAction() {
    return this.$createAction(this.$defaultAction, function (Action) {
      return class extends Action {
        init() {
          super.init();
        }

        request() {
          this._main.log.fatal(`State can't do requests`);
        }
      };
    });
  }

};
