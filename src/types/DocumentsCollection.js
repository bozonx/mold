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

  getUrlParams() {
    return this._main.$$state.getUrlParams(this._root);
  }

  setUrlParams(params) {
    this._main.$$state.setUrlParams(this._root, params);
  }

  /**
   * Load the specified page.
   * It updates mold automatically.
   * @param pageNum
   * @returns {Promise}
   */
  load(pageNum) {
    if (!_.isNumber(pageNum)) throw new Error(`The "pageNum" param is required!`);

    let metaParams = {
      pageNum: pageNum,
      perPage: this._perPage,
    };

    return this._main.$$state.$$request
      .loadDocumentsCollection(this._root, this.getUrlParams(), metaParams)
      .then((resp) => {
        // update mold with server response data
        this.setPage(resp.body, pageNum);

        return resp;
      });
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
    return this._main.$$state.$$request.createDocument(this._root, document, this.getUrlParams())
      .then((resp) => {
        // TODO: менять статус через storage с подъемом события
        delete document.$addedUnsaved;
        delete document.$adding;
        return resp;
      }, (err) => {
        // TODO: менять статус через storage с подъемом события
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
    document.$deleting = true;
    return this._main.$$state.$$request.deleteDocument(this._root, document, this.getUrlParams())
      .then((resp) => {
        delete document.$deleting;
        // remove from page
        if (_.isNumber(document.$pageIndex)) {
          this._main.$$state.remove(concatPath(this._root, document.$pageIndex), document);
        }
        return resp;
      }, (err) => {
        // TODO: менять статус через storage с подъемом события
        delete document.$deleting;
        return err;
      });
  }

}
