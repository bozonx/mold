import _ from 'lodash';

import { concatPath, convertFromLodashToSchema } from '../helpers';
import _TypeBase from './_NodeBase';


export default class Container extends _TypeBase {
  static validateSchema(schema, schemaPath) {
    if (!_.isPlainObject(schema.schema))
      return `Schema definition of container on "${schemaPath}" must has a "schema" param!`;
  }

  constructor(main) {
    super(main);

    this._defaultAction = 'default';
  }

  get type() {
    return 'state';
  }

  $initStorage(moldPath) {
    this._main.$$stateManager.initState(moldPath, this._defaultAction, {});
  }

  $init(moldPath, schema) {
    this.$initStorage(moldPath);
    this._fullSchema = {
      type: 'assoc',
      schema,
    };
    // TODO: !!!! review
    super.$init(moldPath, schema);

    this.actions = {
      'default': this._generateDefaultAction(),
    };
  }

  /**
   * Update container data
   * @param {string} newState
   * @param {object|undefined} eventData - additional data to event
   */
  update(newState, eventData) {
    this.actions.default.update(newState, eventData);
  }

  updateSilent(newState, eventData=undefined) {
    this.actions.default.updateSilent(newState, eventData);
  }

  _generateDefaultAction() {
    return this.$createAction(this._defaultAction, function (Action) {
      return class extends Action {
        init() {
          //this._stateManager.initState(this._moldPath, {}, this._actionName);
          //this._mold.init();
        }

        request() {
          throw new Error(`ERROR: State can't do requests`);
        }
      };
    });
  }

}