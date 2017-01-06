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

  $init(moldPath) {
    super.$init(moldPath);
  }

  /**
   * Get instance of child
   * @param {string} path - path relative to this instance root
   * @returns {object} - instance of child
   */
  child(path) {
    this._main.child(path, this);
  }

  update(newState) {
    this._main.$$state.update(this._root, this._storagePath, _.cloneDeep(newState));
  }

}
