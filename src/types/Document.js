import _ from 'lodash';

import { concatPath } from '../helpers';
import Container from './Container';


export default class Document extends Container{
  constructor(main) {
    super(main);
  }

  get type() {
    return 'document';
  }

  $init(root, schema) {
    super.$init(root, schema);
  }

  /**
   * Load data.
   * @returns {Promise}
   */
  load() {
    return this._main.state.load(this._root, this.getSourceParams());
  }

  save(pathOrNothing) {
    // TODO: pathOrNothing здесь вообще левая тема
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
