import _ from 'lodash';

import { concatPath } from '../helpers';
import _TypeBase from './_TypeBase';


export default class Container extends _TypeBase{
  constructor(main) {
    super(main);

    this.type = 'container';
  }

  $init(root, schema) {
    super.$init(root, schema);

    this._isDocument = !!this._main.schemaManager.getDocument(this._root);
  }

  /**
   * Get child
   * @param {string} path - path relative to this instance root
   * @returns {object} - instance of param or list or container
   */
  child(path) {
    if (!_.isString(path) && !_.isNumber(path))
      throw new Error(`You must pass a path argument.`);

    return this._main.schemaManager.getInstance(concatPath(this._root, path));
  }

  /**
   * Load data.
   * @returns {Promise}
   */
  load() {
    return this._main.state.load(this._root, this.getSourceParams());
  }

  setMold(pathOrValue, valueOrNothing) {
    var path = pathOrValue;
    var value = valueOrNothing;
    var payload;

    if (_.isPlainObject(pathOrValue)) {
      path = '';
      value = pathOrValue;
    }

    if (path) {
      payload = _.set(_.cloneDeep(this.mold), path, value);
    }
    else {
      // set whole container
      payload = _.defaultsDeep(value, _.cloneDeep(this.mold));
    }

    this._main.state.setMold(this._root, payload);
  }

  save(pathOrNothing) {
    var path;
    if (pathOrNothing) {
      path = concatPath(this._root, pathOrNothing);
    }
    else {
      path = this._root;
    }

    return this._main.state.save(path, this.getSourceParams());
  }

}
