import _ from 'lodash';

import { concatPath, convertFromLodashToSchema } from '../helpers';
import _TypeBase from './_TypeBase';


export default class Container extends _TypeBase{
  constructor(main) {
    super(main);
  }

  get type() {
    return 'container';
  }

  $init(moldPath, schemaPath, schema) {
    super.$init(moldPath, schemaPath, schema);
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
   * Get instance of child of first level.
   * @param {string} childPath
   * @returns {*}
   */
  $getChildInstance(childPath) {
    if (childPath.match(/(\.|\[)/)) this._main.$$log.fatal(`Bad child path "${childPath}"`);

    const fullChildMoldPath = concatPath(this._moldPath, childPath);
    const fullChildSchemaPath = concatPath(this._schemaPath, concatPath('schema', convertFromLodashToSchema(childPath)));

    console.log(111111, fullChildMoldPath, this._schemaPath, childPath, fullChildSchemaPath)

    // get container instance
    return this._main.$$schemaManager.$getInstanceByFullPath(fullChildMoldPath, fullChildSchemaPath);
  }

  update(newState) {
    this._main.$$state.update(this._root, this._storagePath, _.cloneDeep(newState));
  }

}
