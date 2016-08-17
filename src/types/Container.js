import _ from 'lodash';

import { concatPath } from '../helpers';
import _TypeBase from './_TypeBase';


export default class Container extends _TypeBase{
  constructor(main) {
    super(main);
  }

  init(root, schema) {
    super.$init(root, schema);

    this.sourceParam = null;
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
   * If you pass path = '' or undefined, it means get data for this container
   * You can pass subpath to get data for nested items
   * @param {string} path - path relative to this instance root
   * @returns {Promise}
   */
  get(path) {
    // TODO: path не нужен нафиг
    return this._main.state.load((path) ? concatPath(this._root, path) : this._root);
  }

  setSourceParams(param) {
    // TODO: test it
    this.sourceParam = param;
  }

  load() {
    // TODO: test it
    // TODO: удалить get(path)
    return this._main.state.load(this._root, this.sourceParam);
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

    return this._main.state.save(path, this.sourceParam);
  }

}
