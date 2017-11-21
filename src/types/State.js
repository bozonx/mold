import _ from 'lodash';

import { concatPath, convertFromLodashToSchema } from '../helpers';
import _TypeBase from './_TypeBase';


export default class Container extends _TypeBase {
  static validateSchema(schema, schemaPath) {
    if (!_.isPlainObject(schema.schema))
      return `Schema definition of container on "${schemaPath}" must have a "schema" param!`;
  }

  constructor(main) {
    super(main);
  }

  get type() {
    return 'state';
  }

  $initStorage(moldPath) {
    const storageData = this._main.$$stateManager.getStorageData(moldPath);
    if (!_.isPlainObject(storageData)) {
      // initialize new data container
      this._main.$$stateManager.initStorageData(moldPath, {});
    }
  }

  $init(paths, schema) {
    this.$initStorage(paths);
    // TODO: !!!! review
    super.$init(paths, schema);
    // this.__readOnlyProps = [];
    // _.each(this.schema.schema, (item, name) => {
    //   if (item.readOnly) this.__readOnlyProps.push(name);
    // });
  }

  /**
   * Update container data
   * @param {string} newState
   * @param {object|undefined} eventData - additional data to event
   */
  update(newState, eventData=undefined) {
    //this._checkForUpdateReadOnly(newState);
    this._main.$$stateManager.updateTopLevel(this._storagePath, _.cloneDeep(newState), eventData);
  }

  updateSilent(newState, eventData=undefined) {
    //this._checkForUpdateReadOnly(newState);
    this._main.$$stateManager.updateSilent(this._storagePath, _.cloneDeep(newState), eventData);
  }

  _checkForUpdateReadOnly(newState) {
    const forbiddenRoProps = _.intersection(_.keys(newState), this.__readOnlyProps);

    if (!_.isEmpty(forbiddenRoProps)) {
      this._main.$$log.fatal(`You can't write to read only props ${JSON.stringify(forbiddenRoProps)}`);
    }
  }

}
