import _ from 'lodash';

import { concatPath, convertFromLodashToSchema } from '../helpers';
import _TypeBase from './_TypeBase';


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
    // TODO: !!!! review
    super.$init(moldPath, schema);

    this.actions = {
      // TODO: !!!!
      'default': this._generateLoadAction(),
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

}
