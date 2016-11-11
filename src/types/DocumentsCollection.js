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
    //concatPath(this._root, pageNum)
    // TODO: номер страницы надо передать в sourceParams или в documentsParams
    return this._main.$$state.$$request.loadDocumentsCollection(this._root, this.getSourceParams());
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

}
