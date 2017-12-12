import _ from 'lodash';

import _NodeBase from './_NodeBase';


export default class State extends _NodeBase {
  static validateSchema(schema, schemaPath) {
    if (!_.isPlainObject(schema.schema)) {
      return `Schema definition of container on "${schemaPath}" must has a "schema" param!`;
    }
  }

  constructor(main) {
    super(main);

    this._defaultAction = 'default';
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

    //this.$fullSchema = schema;

    super.$init(moldPath, schema);

    this.actions = {
      'default': this._generateDefaultAction(),
    };
  }

  /**
   * Update container data
   * @param {string} newState
   */
  update(newState) {
    this.actions.default.update(newState);
  }

  updateSilent(newState) {
    this.actions.default.updateSilent(newState);
  }

  _generateDefaultAction() {
    return this.$createAction(this._defaultAction, function (Action) {
      return class extends Action {
        init() {
          super.init();
        }

        request() {
          throw new Error(`ERROR: State can't do requests`);
        }
      };
    });
  }

}
