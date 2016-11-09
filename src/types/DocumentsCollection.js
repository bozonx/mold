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
    // TODO: не особо нужно!!!

    var preparedItem = {
      ...item,
      $addedUnsaved: true,
    };

    // TODO: родетельский addItem не нужнен
    super.addItem(preparedItem);

    // TODO: add save buffer request - но не в инстансе
  }

  /**
   * Add new document and save.
   * It creates new page if last page was overflowed.
   *
   * It add item to save buffer. It's saving after calling save().
   */
  addAndSave(item) {
    var preparedItem = {
      ...item,
      $saving: true,
    };

    return this._main.$$state.$$request.addDocument(this._root, this.getSourceParams(), item)
      .then((resp) => {
        if (resp.coocked && resp.coocked.itemPosition) {
          // TODO: мы не можем точно значть страницу и позицию, так как это зависит от сортировки
          //var page = resp.coocked.itemPosition.page;
          //var position = resp.coocked.itemPosition.position;

          // TODO: пометить все, ранее загруженные страницы, как не актуальные
          // TODO: при последующей запросе mold сделать запрос на обновление страницы
        }
        return resp;
      });
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

  // /**
  //  * Save unsaved added or removed items.
  //  * @returns {Promise}
  //  */
  // save() {
  //   return this._main.$$state.$$request.saveDocumetsCollection(this._root, this.getSourceParams());
  // }
}
