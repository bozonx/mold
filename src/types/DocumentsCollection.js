import _ from 'lodash';

import { concatPath } from '../helpers';
import PagedCollection from './PagedCollection';


export default class DocumentsCollection extends PagedCollection{
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
   * Send request to create document.
   * You can use recently added document.
   * @param {object} document
   * @returns {Promise}
   */
  createDocument(document) {
    // TODO: менять статус через storage с подъемом события
    document.$adding = true;
    return this._main.$$state.$$request.createDocument(this._root, this.getSourceParams(), document)
      .then((resp) => {
        delete document.$addedUnsaved;
        delete document.$adding;
        return resp;
      }, (err) => {
        delete document.$adding;
        return err;
      });
  }

  /**
   * Send request to delete document.
   * It adds "$deleting" prop to document.
   * After success response, it remove document from mold.
   * @param {object} document
   * @returns {Promise}
   */
  deleteDocument(document) {
    // TODO: менять статус через storage с подъемом события
    document.$deletting = true;
    return this._main.$$state.$$request.deleteDocument(this._root, this.getSourceParams(), document)
      .then((resp) => {
        delete document.$deletting;
        return resp;
      }, (err) => {
        delete document.$deletting;
        return err;
      });
  }



  // /**
  //  * add document to the end of last page.
  //  * It creates new page if last page was overflowed.
  //  *
  //  * It add item to save buffer. It's saving after calling save().
  //  */
  // addDocument(item) {
  //   // TODO: не особо нужно!!!
  //
  //   var preparedItem = {
  //     ...item,
  //     $addedUnsaved: true,
  //   };
  //
  //   // TODO: родетельский addItem не нужнен
  //   super.addItem(preparedItem);
  //
  //   // TODO: add save buffer request - но не в инстансе
  // }
  //
  // /**
  //  * Add new document and save.
  //  * It creates new page if last page was overflowed.
  //  *
  //  * It add item to save buffer. It's saving after calling save().
  //  */
  // addAndSave(item) {
  //   var preparedItem = {
  //     ...item,
  //     $saving: true,
  //   };
  //
  //   return this._main.$$state.$$request.addDocument(this._root, this.getSourceParams(), item)
  //     .then((resp) => {
  //       if (resp.body && resp.body.itemPosition) {
  //         // TODO: мы не можем точно значть страницу и позицию, так как это зависит от сортировки
  //         //var page = resp.body.itemPosition.page;
  //         //var position = resp.body.itemPosition.position;
  //
  //         // TODO: пометить все, ранее загруженные страницы, как не актуальные
  //         // TODO: при последующей запросе mold сделать запрос на обновление страницы
  //       }
  //       return resp;
  //     });
  // }



  // /**
  //  * Save unsaved added or removed items.
  //  * @returns {Promise}
  //  */
  // save() {
  //   return this._main.$$state.$$request.saveDocumetsCollection(this._root, this.getSourceParams());
  // }
}
