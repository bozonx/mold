const _ = require('lodash');

const { concatPath, getPrimaryName } = require('../helpers/helpers');
const NodeBase = require('./_NodeBase');


module.exports = class Catalogue extends NodeBase {
  static validateSchema(schema, schemaPath) {
    if (!_.isPlainObject(schema.item)) {
      return `The definition of "catalogue" node on "${schemaPath}" must has a "item" param!`;
    }
  }

  get type() {
    return 'catalogue';
  }

  get isLoading() {
    return this.actions[this.$defaultAction].pending;
  }

  $init(moldPath, schema) {
    super.$init(moldPath, schema);

    // convert to simple schema type
    this.$primitiveSchema = {
      type: 'array',
      item: schema.item,
    };

    const defaultActions = {
      [this.$defaultAction]: {
        method: 'filter',
        ...this._schema.actions && this._schema.actions[this.$defaultAction],
      },
      create: {
        method: 'create',
        ...this._schema.actions && this._schema.actions.create,
      },
      remove: {
        method: 'delete',
        ...this._schema.actions && this._schema.actions.remove,
      },
    };

    this.$initActions(defaultActions);
  }

  load(params) {
    return this.actions.default.request(params);
  }

  // create(payload) {
  //   return this.actions.create.request(payload);
  // }

  // _generateDefaultAction() {
  //   return this.$createAction(this._defaultAction, (Action) => {
  //     return class extends Action {
  //       init() {
  //         super.init();
  //
  //         this.setDriverParams({ method: 'filter' });
  //         this.primaryName = getPrimaryName(this._schema);
  //       }
  //
  //       // add $$key param to solid after data has loaded
  //       responseTransformCb(resp) {
  //         return {
  //           ...resp,
  //           body: _.map(resp.body, (item) => {
  //             return {
  //               ...item,
  //               $$key: item[this.primaryName],
  //             };
  //           }),
  //         };
  //       }
  //
  //       request(payload) {
  //         return super.request(payload)
  //           .then((resp) => {
  //             // set copy of server data to state
  //             this.update(this.$storage.getSolid(this._moldPath, this._actionName));
  //
  //             return resp;
  //           });
  //       }
  //     };
  //   });
  // }

  _generateCreateAction() {
    const catalogue = this;

    return this.$createAction('create', (Action) => {
      return class extends Action {
        init() {
          this._schema = {
            type: 'assoc',
            schema: catalogue.schema.item,
          };

          super.init();

          this.setDriverParams({ method: 'create' });
          this.primaryName = getPrimaryName(catalogue.schema);
        }

        // add $$key param to solid after data has loaded
        responseTransformCb(resp) {
          return {
            ...resp,
            body: {
              ...resp.body,
              $$key: resp.body[this.primaryName],
            },
          };
        }

      };
    });
  }

  /**
   * Load the specified page.
   * It updates mold automatically.
   * @param {number} pageNum
   * @param {object} preRequest - raw params to driver's request
   * @returns {Promise}
   */
  $load(pageNum, preRequest = undefined) {
    if (!_.isNumber(pageNum)) this._main.log.fatal(`The "pageNum" param is required!`);

    const metaParams = _.omitBy({
      pageNum,
      perPage: this._perPage,
    }, _.isUndefined);

    this._setPageLoadingState(pageNum, true);
    // rise an event
    this._main.$$state.storageEmitSilent(this._moldPath);

    const request = _.defaultsDeep({
      method: 'filter',
      moldPath: this._moldPath,
      metaParams,
    }, preRequest);

    return this._main.$$state.request.sendRequest(request, this.schema, this.getUrlParams())
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
   * @param {object} preRequest - raw params to driver's request
   * @returns {Promise}
   */
  $create(documentMold, preRequest = undefined) {
    // change with event rising
    this._updateDoc(documentMold, { $saving: true });

    const request = _.defaultsDeep({
      method: 'create',
      moldPath: this._moldPath,
      payload: documentMold,
    }, preRequest);

    return this._main.$$state.request.sendRequest(request, this.schema, this.getUrlParams())
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
        // TODO: что за $saving?
        this._updateDoc(documentMold, { $saving: false });

        return Promise.reject(err);
      });
  }

  /**
   * Send request to delete document.
   * It adds "$deleting" prop to document.
   * After success response, it remove document from page in storage.
   * @param {object} documentMold - like {id: 0, $pageIndex: 0, $index: 0}
   * @param {object} preRequest - raw params to driver's request
   * @returns {Promise}
   */
  $remove(documentMold, preRequest = undefined) {
    // change with event rising
    this._updateDoc(documentMold, { $deleting: true });

    const request = _.defaultsDeep({
      method: 'remove',
      moldPath: this._moldPath,
      payload: documentMold,
    }, preRequest);

    return this._main.$$state.request.sendRequest(request, this.schema, this.getUrlParams())
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

  //
  // _updateDoc(documentMold, newState) {
  //   const isDocumentInPage = _.isNumber(documentMold.$pageIndex) && _.isNumber(documentMold.$index);
  //   // update document in one of page
  //   if (isDocumentInPage) {
  //     const storagePathToDocInPages = concatPath(
  //       concatPath(this._storagePagesPath, documentMold.$pageIndex),
  //       documentMold.$index);
  //
  //     this._main.$$state.updateSilent(storagePathToDocInPages, newState);
  //   }
  //
  //   // update document in "documents"
  //   const primaryName = findPrimary(this.schema.item);
  //   const storagePathToDocInDocuments = concatPath(
  //     concatPath(this._storagePath, 'documents'), `[${documentMold[primaryName]}]`);
  //
  //   if (!this._main.$$state.getState(storagePathToDocInDocuments)) return;
  //   this._main.$$state.updateSilent(storagePathToDocInDocuments, newState);
  // }
  // _setPageLoadingState(pageNum, loading) {
  //   if (loading) {
  //     this._loading.push(pageNum);
  //     return;
  //   }
  //
  //   // remove page's loading state
  //
  //   const findedIndex = _.findIndex(this._loading, (item) => {
  //     return item === pageNum;
  //   });
  //
  //   // if it didn't find - do nothing
  //   if (findedIndex === -1) return;
  //
  //   // remove page from loading state
  //   this._loading.splice(findedIndex, 1);
  // }
  //
  // _applyDefaults(preRequest, actionName) {
  //   if (!this.actionDefaults[actionName]) return preRequest;
  //
  //   return _.defaultsDeep(_.cloneDeep(preRequest), this.actionDefaults[actionName]);
  // }

  // /**
  //  * Overwrote clear.
  //  * @param {object|undefined} eventData - additional data to event
  //  */
  // clear(eventData=undefined) {
  //   this._main.$$state.clear(this._storagePagesPath, eventData);
  // }

  // getUrlParams() {
  //   return this._main.$$state.getUrlParams(this._moldPath);
  // }
  //
  // setUrlParams(params) {
  //   this._main.$$state.setUrlParams(this._moldPath, params);
  // }

};
