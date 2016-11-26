import _ from 'lodash';

import { concatPath } from '../helpers';
import _TypeBase from './_TypeBase';


export default class Container extends _TypeBase{
  constructor(main) {
    super(main);
  }

  get type() {
    return 'container';
  }

  $init(root) {
    super.$init(root);
    this._storagePath = this._root;
  }

  /**
   * Get child
   * @param {string} path - path relative to this instance root
   * @returns {object} - instance of param or list or container
   */
  child(path) {
    if (!_.isString(path))
      throw new Error(`You must pass a path argument.`);

    return this._main.$$schemaManager.getInstance(concatPath(this._root, path));
  }

  update(newState) {
    this._main.$$state.update(this._root, this._storagePath, _.cloneDeep(newState));
  }

}
