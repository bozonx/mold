import _ from 'lodash';

import { concatPath } from '../helpers';
import PagedCollection from './PagedCollection';


export default class DocumentsCollection extends PagedCollection {
  static validateSchema(schema, schemaPath) {
  }

  constructor(main) {
    super(main);
  }

  get type() {
    return 'documentsCollection';
  }

  get loading() {
    return this._loading;
  }

  $initStorage(paths) {
    if (!_.isPlainObject(this._main.$$state.getMold(paths.storage))) {
      this._main.$$state.setSilent(paths.storage, {
        pages: [],
        state: {},
        documents: {},
      });
    }
  }

  $init(paths, schema) {
    this._storagePath = paths.storage + '.pages';
    this._rootStoragePath = paths.storage;

    super.$init(paths, schema);

    this._storageData = this._main.$$state.getMold(paths.mold);
    this._moldPages = this._storageData.pages;

    this._storageData.state = {
      loading: [],
    };
    this._loading = this._storageData.state.loading;
  }

  getUrlParams() {
    return this._main.$$state.getUrlParams(this._moldPath);
  }

  setUrlParams(params) {
    this._main.$$state.setUrlParams(this._moldPath, params);
  }


  /**
   * Get instance of child
   * @param {string|number} primaryId - primary id like 0 or '[0]'
   * @returns {object} - instance of child
   */
  child(primaryId) {
    const preparedPath = (_.isNumber(primaryId)) ? `[${primaryId}]` : primaryId;
    return this._main.child(preparedPath, this);
  }

  /**
   * Get paths of child of first level.
   * @param {string} primaryId
   * @returns {{mold: string, schema: string, storage: string|undefined}}
   */
  $getChildPaths(primaryId) {
    return {
      mold: concatPath(this._rootStoragePath, primaryId),
      schema: concatPath(this._schemaPath, 'item'),
      storage: concatPath(this._moldPath, concatPath('documents', primaryId)),
    }
  }

  /**
   * Get instance of element. (not page!).
   * @param {string} primaryId - id of element, like '[0]'
   * @returns {Object|undefined} - if undefined - it means not found.
   */
  $getChildInstance(primaryId) {
    if (!primaryId || !_.isString(primaryId)) return;
    if (!primaryId.match(/^\[\d+]$/)) this._main.$$log.fatal(`Bad primaryId "${primaryId}"`);

    const paths = this.$getChildPaths(primaryId);

    return this._main.$$schemaManager.$getInstanceByFullPath(paths);
  }


  /**
   * Load the specified page.
   * It updates mold automatically.
   * @param {number} pageNum
   * @param {object} metaOverrides - override request's meta params
   * @returns {Promise}
   */
  load(pageNum, metaOverrides) {
    if (!_.isNumber(pageNum)) this._main.$$log.fatal(`The "pageNum" param is required!`);

    let metaParams = _.omitBy({
      pageNum: pageNum,
      perPage: this._perPage,
    }, _.isUndefined);

    if (_.isPlainObject(metaOverrides)) {
      metaParams = {
        ...metaParams,
        ...metaOverrides,
      }
    }

    this._setPageLoadingState(pageNum, true);
    // rise an event
    this._main.$$storage.emit(this._moldPath);

    return this._main.$$state.$$request.sendRequest(
        'filter', this._moldPath, this._schema, undefined, metaParams, this.getUrlParams())
      .then((resp) => {
        this._setPageLoadingState(pageNum, false);
        // update mold with server response data
        this.setPage(resp.body, pageNum);

        return resp;
      }, (err) => {
        this._setPageLoadingState(pageNum, false);
        return Promise.reject(err);
      });
  }

  /**
   * Send request to create document.
   * You can use recently added document.
   * @param {object} documentMold
   * @param {object} metaParams
   * @returns {Promise}
   */
  create(documentMold, metaParams=undefined) {
    // change with event rising
    this._updateDoc(documentMold, {
      $saving: true,
    });

    return this._main.$$state.$$request.sendRequest(
        'create', this._moldPath, this._schema, documentMold, metaParams, this.getUrlParams())
      .then((resp) => {
        // update document if it's in storage
        this._updateDoc(documentMold, {
          ...resp.body,
          $addedUnsaved: undefined,
          $saving: false,
        });

        // remove for any way
        delete documentMold.$addedUnsaved;

        return resp;
      }, (err) => {
        this._updateDoc(documentMold, {
          $saving: false,
        });
        return Promise.reject(err);
      });
  }

  /**
   * Send request to delete document.
   * It adds "$deleting" prop to document.
   * After success response, it remove document from mold.
   * @param {object} documentMold
   * @param {object} metaParams
   * @returns {Promise}
   */
  remove(documentMold, metaParams=undefined) {
    // console.log(1111, documentMold)
    //
    // const document = this.child(`[${documentMold.$pageIndex}][${documentMold.$index}]`);
    //
    // console.log(6666666, document)
    //
    // document.remove(metaParams);


    // change with event rising
    this._updateDoc(documentMold, { $deleting: true });
    return this._main.$$state.$$request.sendRequest(
        'delete', this._moldPath, this._schema, documentMold, metaParams, this.getUrlParams())
      .then((resp) => {
        this._updateDoc(documentMold, { $deleting: false });
        // remove from page
        if (_.isNumber(documentMold.$pageIndex)) {
          const storagePathToPage = concatPath(this._storagePath, documentMold.$pageIndex);
          this._main.$$state.remove(this._moldPath, storagePathToPage, documentMold);
        }
        return resp;
      }, (err) => {
        this._updateDoc(documentMold, { $deleting: false });
        return Promise.reject(err);
      });
  }

  _updateDoc(documentMold, newState) {
    // TODO: переделать на инстанс документа
    if (!_.isNumber(documentMold.$pageIndex) || !_.isNumber(documentMold.$index)) return;
    const pathToDoc = concatPath(concatPath(this._moldPath, documentMold.$pageIndex), documentMold.$index);
    const storagePathToDoc = concatPath(concatPath(this._storagePath, documentMold.$pageIndex), documentMold.$index);
    this._main.$$state.update(pathToDoc, storagePathToDoc, newState);
  }

  _setPageLoadingState(pageNum, loading) {
    if (loading) {
      this._loading.push(pageNum);
      return;
    }

    // remove page's loading state

    const findedIndex = _.findIndex(this._loading, (item) => {
      return item === pageNum;
    });

    // if it didn't find - do nothing
    if (findedIndex === -1) return;

    // remove page from loading state
    this._loading.splice(findedIndex, 1);
  }

}
