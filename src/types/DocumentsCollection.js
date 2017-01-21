import _ from 'lodash';

import { concatPath, findPrimary } from '../helpers';
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

  /**
   * Overwrote. Get real mold.
   */
  get mold() {
    return this._mold.pages;
  }

  $initStorage() {
    if (!_.isPlainObject(this._main.$$state.getMold(this._storagePath))) {
      this._main.$$state.setSilent(this._storagePath, {
        pages: [],
        state: {},
        documents: {},
      });
    }
  }

  $init(paths, schema) {
    this._storagePath = paths.storage;
    this._storagePagesPath = paths.storage + '.pages';

    super.$init(paths, schema);

    this._mold.state = {
      loading: [],
    };
    this._loading = this._mold.state.loading;

    this.action = {
      load: (pageNum, preRequest) => {
        return this._load(pageNum, this._applyDefaults(preRequest, 'load')) },
      create: (documentMold, preRequest) => {
        return this._create(documentMold, this._applyDefaults(preRequest, 'create')) },
      remove: (documentMold, preRequest) => {
        return this._remove(documentMold, this._applyDefaults(preRequest, 'remove')) },
    };
    this.actionDefaults = {};
    this._initActions();
  }

  /**
   * Overwrote clear.
   * @param {object|undefined} eventData - additional data to event
   */
  clear(eventData=undefined) {
    this._main.$$state.clear(this._storagePagesPath, eventData);
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
      mold: concatPath(this._moldPath, primaryId),
      schema: concatPath(this._schemaPath, 'item'),
      storage: concatPath(this._storagePath, concatPath('documents', primaryId)),
    }
  }

  /**
   * Get instance of element. (not page!).
   * @param {string} primaryId - id of element, like '[0]' or ["s-3"]
   * @returns {Object|undefined} - if undefined - it means not found.
   */
  $getChildInstance(primaryId) {
    if (!primaryId || !_.isString(primaryId)) return;
    if (!primaryId.match(/^\[[^\s\[\]]+]$/)) this._main.$$log.fatal(`Bad primaryId "${primaryId}"`);

    const paths = this.$getChildPaths(primaryId);

    return this._main.$$schemaManager.$getInstanceByFullPath(paths);
  }

  load(...params) { return this.action.load(...params) }
  create(...params) { return this.action.create(...params) }
  remove(...params) { return this.action.remove(...params) }

  /**
   * Load the specified page.
   * It updates mold automatically.
   * @param {number} pageNum
   * @param {object} options - raw params to driver's request
   * @returns {Promise}
   */
  _load(pageNum, options=undefined) {
    if (!_.isNumber(pageNum)) this._main.$$log.fatal(`The "pageNum" param is required!`);

    let metaParams = _.omitBy({
      pageNum: pageNum,
      perPage: this._perPage,
    }, _.isUndefined);

    this._setPageLoadingState(pageNum, true);
    // rise an event
    this._main.$$state.storageEmit(this._moldPath);

    return this._main.$$state.$$request.sendRequest(
      {
        method: 'filter',
        moldPath: this._moldPath,
        options,
        metaParams,
      }, this.schema, this.getUrlParams())
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
   * @param {object} options - raw params to driver's request
   * @returns {Promise}
   */
  _create(documentMold, options=undefined) {
    const metaParams = undefined;

    // change with event rising
    this._updateDoc(documentMold, {
      $saving: true,
    });

    return this._main.$$state.$$request.sendRequest(
      {
        method: 'create',
        moldPath: this._moldPath,
        payload: documentMold,
        options,
        metaParams,
      }, this.schema, this.getUrlParams())
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
   * After success response, it remove document from page in storage.
   * @param {object} documentMold - like {id: 0, $pageIndex: 0, $index: 0}
   * @param {object} options - raw params to driver's request
   * @returns {Promise}
   */
  _remove(documentMold, options=undefined) {
    const metaParams = undefined;

    // change with event rising
    this._updateDoc(documentMold, { $deleting: true });

    return this._main.$$state.$$request.sendRequest(
      {
        method: 'remove',
        moldPath: this._moldPath,
        payload: documentMold,
        options,
        metaParams,
      },
      this.schema, this.getUrlParams())
      .then((resp) => {
        this._updateDoc(documentMold, {
          $deleting: false,
          $deleted: true,
        });

        // remove from page
        if (_.isNumber(documentMold.$pageIndex)) {
          const storagePathToPage = concatPath(this._storagePagesPath, documentMold.$pageIndex);
          this._main.$$state.remove(storagePathToPage, documentMold);
        }
        return resp;
      }, (err) => {
        this._updateDoc(documentMold, { $deleting: false });
        return Promise.reject(err);
      });
  }

  _updateDoc(documentMold, newState) {
    const isDocumentInPage = _.isNumber(documentMold.$pageIndex) && _.isNumber(documentMold.$index);
    // update document in one of page
    if (isDocumentInPage) {
      const storagePathToDocInPages = concatPath(
        concatPath(this._storagePagesPath, documentMold.$pageIndex),
        documentMold.$index);

      this._main.$$state.update(storagePathToDocInPages, newState);
    }

    // update document in "documents"
    const primaryName = findPrimary(this.schema.item);
    const storagePathToDocInDocuments = concatPath(
      concatPath(this._storagePath, 'documents'), `[${documentMold[primaryName]}]`);

    if (!this._main.$$state.getMold(storagePathToDocInDocuments)) return;
    this._main.$$state.update(storagePathToDocInDocuments, newState);
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

  _applyDefaults(preRequest, actionName) {
    if (!this.actionDefaults[actionName]) return preRequest;

    return _.defaultsDeep(_.cloneDeep(preRequest), this.actionDefaults[actionName]);
  }

  _initActions() {
    _.each(this.schema.action, (item, name) => {
      if (_.isFunction(item)) {
        // custom method or overwrote method
        this.action[name] = (...params) => item.bind(this)(...params, this);
      }
      else if (_.isPlainObject(item)) {
        // Default acton's params
        this.actionDefaults[name] = item;
      }
    });
  }

}
