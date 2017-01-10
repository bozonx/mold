import _ from 'lodash';

import { concatPath, getFirstChildPath } from '../helpers';
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

  $getChildInstance(primaryIdOrSubPath, restOfPath) {
    const childPath = getFirstChildPath(primaryIdOrSubPath);
    const fullChildPath = concatPath(this._moldPath, childPath);

    // get container instance
    return this._main.$$schemaManager.$getInstanceByFullPath(fullChildPath);
  }

  update(newState) {
    this._main.$$state.update(this._root, this._storagePath, _.cloneDeep(newState));
  }

}
