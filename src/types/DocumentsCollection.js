import _ from 'lodash';

import { concatPath } from '../helpers';
import _PagedCollectionBase from './_PagedCollectionBase';


export default class DocumentsCollection extends _PagedCollectionBase{
  constructor(main) {
    super(main);
  }

  get type() {
    return 'documentsCollection';
  }

  $init(root) {
    super.$init(root);
  }

  getSourceParams() {
    return this._main.$$state.getSourceParams(this._root);
  }

  setSourceParams(params) {
    this._main.$$state.setSourceParams(this._root, params);
  }

  /**
   * add document to the end of last page.
   * It creates new page if last page was overflowed.
   *
   * It add item to save buffer. It's saving after calling save().
   */
  addDocument(item) {
    var preparedItem = {
      ...item,
      $addedUnsaved: true,
    };

    super.addItem(preparedItem);

    // TODO: add save buffer request - но не в инстансе
  }

  /**
   * Load the specified page.
   * It updates mold automatically.
   * @param pageNum
   * @returns {Promise}
   */
  load(pageNum) {
    if (!_.isNumber(pageNum)) throw new Error(`The "pageNum" param is required!`);

    return this._main.$$state.$$request.loadDocumentsCollection(concatPath(this._root, pageNum), this.getSourceParams());
  }

  /**
   * Save unsaved added or removed items.
   * @returns {Promise}
   */
  save() {
    return this._main.$$state.$$request.saveDocumetsCollection(this._root, this.getSourceParams());
  }
}
