import _ from 'lodash';

import _NodeBase from './_NodeBase';


export default class State extends _NodeBase {
  static validateSchema(schema, schemaPath) {
    if (!_.isPlainObject(schema.schema)) {
      return `Schema definition of "state" node on "${schemaPath}" must has a "schema" param!`;
    }
  }

  constructor(main) {
    super(main);

    this.$defaultAction = 'default';
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

    this.actions = {
      'default': this._generateDefaultAction(),
    };
  }

  /**
   * Update container data
   * @param {string} newState
   */
  update(newState) {
    // TODO: move to _NodeBase
    this.actions.default.update(newState);
  }

  updateSilent(newState) {
    // TODO: move to _NodeBase
    this.actions.default.updateSilent(newState);
  }

  _generateDefaultAction() {
    return this.$createAction(this.$defaultAction, function (Action) {
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
