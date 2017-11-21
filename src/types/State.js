import _ from 'lodash';

import { concatPath, convertFromLodashToSchema } from '../helpers';
import _TypeBase from './_TypeBase';


export default class Container extends _TypeBase{
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

  $initStorage(paths) {
    if (!_.isPlainObject(this._main.$$state.getStorageData(paths.storage))) {
      this._main.$$state.setSilent(paths.storage, {});
    }
  }

  $init(paths, schema) {
    this.$initStorage(paths);
    super.$init(paths, schema);
    this.__readOnlyProps = [];
    _.each(this.schema.schema, (item, name) => {
      if (item.readOnly) this.__readOnlyProps.push(name);
    });
  }

  /**
   * Get instance of child
   * @param {string} path - path relative to this instance root
   * @returns {object} - instance of child
   */
  child(path) {
    return this._main.child(path, this);
  }

  /**
   * Get paths of child of first level.
   * @param {string} childPath
   * @returns {{mold: string, schema: string, storage: string}}
   */
  $getChildPaths(childPath) {
    return {
      mold: concatPath(this._moldPath, childPath),
      schema: concatPath(this._schemaPath, concatPath('schema', convertFromLodashToSchema(childPath))),
      storage: concatPath(this._storagePath, childPath),
    }
  }

  /**
   * Get instance of child of first level.
   * @param {string} childPath
   * @returns {*}
   */
  $getChildInstance(childPath) {
    if (childPath.match(/(\.|\[)/)) this._main.$$log.fatal(`Bad child path "${childPath}"`);

    const paths = this.$getChildPaths(childPath);

    // get container instance
    return this._main.$$typeManager.$getInstanceByFullPath(paths);
  }

  /**
   * Update container data
   * @param {string} newState
   * @param {object|undefined} eventData - additional data to event
   */
  update(newState, eventData=undefined) {
    this._checkForUpdateReadOnly(newState);
    this._main.$$state.update(this._storagePath, _.cloneDeep(newState), eventData);
  }

  updateSilent(newState, eventData=undefined) {
    this._checkForUpdateReadOnly(newState);
    this._main.$$state.updateSilent(this._storagePath, _.cloneDeep(newState), eventData);
  }

  _checkForUpdateReadOnly(newState) {
    const forbiddenRoProps = _.intersection(_.keys(newState), this.__readOnlyProps);

    if (!_.isEmpty(forbiddenRoProps)) {
      this._main.$$log.fatal(`You can't write to read only props ${JSON.stringify(forbiddenRoProps)}`);
    }
  }

}
