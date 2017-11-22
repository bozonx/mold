import _ from 'lodash';

import { correctUpdatePayload, omitUnsaveable } from '../helpers';
import _Action from './_Action';
import State from './State';


export default class Document extends State {
  static validateSchema(schema, schemaPath) {
    if (!_.isPlainObject(schema.schema))
      return `Schema definition of document on "${schemaPath}" must has a "schema" param!`;
  }

  constructor(main) {
    super(main);

    // TODO: move to storage meta
    //this._lastChanges = {};
  }

  get type() {
    return 'document';
  }

  isLoading(action=undefined) {
    return this._main.$$stateManager.getMeta(this._moldPath, 'loading', action);
  }

  isSaving(action=undefined) {
    return this._main.$$stateManager.getMeta(this._moldPath, 'saving', action);
  }

  // /**
  //  * Get changes from last save to the moment.
  //  * @param {string|undefined} action - name of action
  //  * @returns {object}
  //  */
  // getLastChanges(action=undefined) {
  //   return this._main.$$stateManager.getMeta(this._moldPath, 'lastChanges', action);
  // }

  $init(paths, schema) {
    super.$init(paths, schema);

    this.actions = {
      load: this._generateLoadAction(),
    };

    // this.action = {
    //   load: (preRequest) => {
    //     return this.$load(this._applyDefaults(preRequest, 'load'))
    //   },
    //   put: (newState, preRequest) => {
    //     return this.$put(newState, this._applyDefaults(preRequest, 'put'))
    //   },
    //   patch: (newState, preRequest) => {
    //     return this.$patch(newState, this._applyDefaults(preRequest, 'patch'))
    //   },
    //   remove: (preRequest) => {
    //     return this.$remove(this._applyDefaults(preRequest, 'remove'))
    //   },
    // };
    this.actionDefaults = {};
    this._initActions();
  }

  getUrlParams() {
    // TODO: use storage meta
    // TODO: по идее на каждый запрос надо сохранять свои url params
    return this._main.$$state.getUrlParams(this._moldPath);
  }

  setUrlParams(params) {
    // TODO: use storage meta
    this._main.$$state.setUrlParams(this._moldPath, params);
  }

  update(newState, eventData=undefined, action=undefined) {
    // const lastChanges = correctUpdatePayload(
    //   this._main.$$stateManager.getMeta(this._moldPath, 'lastChanges', action), newState);
    // this._main.$$stateManager.updateMeta(this._moldPath, { lastChanges }, action);

    // TODO: use action
    super.update(newState, eventData);
  }

  // TODO: updateSilent

  load(...params) { return this.action.load(...params) }
  put(...params) { return this.action.put(...params) }
  patch(...params) { return this.action.patch(...params) }
  remove(...params) { return this.action.remove(...params) }


  _createAction(actionName) {
    new _Action(this._moldPath, actionName);
  }


  _generateLoadAction() {
    const actionInstance = new _Action(this._moldPath, 'load');

    this._createAction((Action) => {
      return class extends Action {
        request(method, driverRequestParams, payload) {
          this._main.$$stateManager.updateMeta(this._moldPath, { loading: true });

          return super.request(method, driverRequestParams, payload)
            .then((resp) => {
              // update mold with server response data
              this._main.$$stateManager.setBottomLevel(this._moldPath, resp.body);
              this._main.$$stateManager.updateMeta(this._moldPath, {
                loading: false,
                //lastChanges: {},
              });

              return resp;
            })
            .catch((err) => {
              this._main.$$stateManager.updateMeta(this._moldPath, { loading: false });

              return Promise.reject(err);
            });
        }
      }
    });
  }

  /**
   * Load data from driver.
   * @param {object|undefined} driversRequestParams - params for driver's request
   * @returns {Promise}
   */
  $defaultLoad(driversRequestParams=undefined) {
    this._main.$$stateManager.updateMeta(this._moldPath, { loading: true });

    return this._doLoadRequest(driversRequestParams)
      .then((resp) => {
        // update mold with server response data
        this._main.$$stateManager.setBottomLevel(this._moldPath, resp.body);
        this._main.$$stateManager.updateMeta(this._moldPath, {
          loading: false,
          //lastChanges: {},
        });

        return resp;
      }, (err) => {
        this._main.$$stateManager.updateMeta(this._moldPath, { loading: false });

        return Promise.reject(err);
      });
  }

  /**
   * Save actual state.
   * @param {object|undefined} newState
   * @param {object} preRequest - raw params to driver's request
   * @returns {Promise}
   */
  $defaultPut(newState=undefined, preRequest=undefined) {
    const action = 'put';
    if (newState) this.update(newState);
    this._main.$$stateManager.updateMeta(this._moldPath, { pending: true }, action);
    this._main.$$stateManager.updateMeta(this._moldPath, { saving: true });

    return this._doSaveRequest('put', preRequest)
      .then((resp) => {
        // update mold with server response data
        this._main.$$stateManager.setBottomLevel(this._moldPath, resp.body, action);
        this._main.$$stateManager.updateMeta(this._moldPath, { pending: false }, action);
        this._main.$$stateManager.updateMeta(this._moldPath, {
          saving: false,
          //lastChanges: {},
        });

        return resp;
      }, (err) => {
        this._main.$$stateManager.updateMeta(this._moldPath, { pending: false }, action);
        this._main.$$stateManager.updateMeta(this._moldPath, { saving: false });

        return Promise.reject(err);
      });
  }

  /**
   * Save actual state.
   * @param {object|undefined} newState
   * @param {object} preRequest - raw params to driver's request
   * @param {string|undefined} action - name of action
   * @returns {Promise}
   */
  $defaultPatch(newState=undefined, preRequest=undefined) {
    const action = 'put';
    if (newState) this.update(newState);
    this._main.$$stateManager.updateMeta(this._moldPath, { pending: true }, action);
    this._main.$$stateManager.updateMeta(this._moldPath, { saving: true });

    return this._doSaveRequest('patch', preRequest)
      .then((resp) => {
        // update mold with server response data
        this._main.$$stateManager.setBottomLevel(this._moldPath, resp.body, action);
        this._main.$$stateManager.updateMeta(this._moldPath, { pending: false }, action);
        this._main.$$stateManager.updateMeta(this._moldPath, {
          saving: false,
          //lastChanges: {},
        });

        return resp;
      }, (err) => {
        this._main.$$stateManager.updateMeta(this._moldPath, { pending: false }, action);
        this._main.$$stateManager.updateMeta(this._moldPath, { saving: false });

        return Promise.reject(err);
      });
  }


  /**
   * Delete a document via documentsCollection.
   * You can't remove document that not inside a collection.
   * @param {object} preRequest
   * @return {Promise}
   */
  $remove(preRequest=undefined) {
    const myDocumentsCollection = this.getParent();

    if (!myDocumentsCollection)
      this._main.$$log.fatal(`You can remove only from DocumentsCollection`);

    if (myDocumentsCollection.type != 'documentsCollection')
      this._main.$$log.fatal(`The parent of document isn't a DocumentsCollection. You can remove only from DocumentsCollection`);

    return myDocumentsCollection.remove(this.mold, preRequest);
  }

  _doLoadRequest(driverRequestParams) {
    const request = _.defaultsDeep({
      method: 'get',
      moldPath: this._moldPath,
    }, driverRequestParams);

    // TODO: ??? getUrlParams
    return this._main.$$stateManager.$$request.sendRequest(request, this.schema, this.getUrlParams());
  }


  _doSaveRequest(method, driverRequestParams) {
    const request = _.defaultsDeep({
      method: method,
      moldPath: this._moldPath,
      // TODO: WTF???
      payload: omitUnsaveable(this._mold, this.schema),
    }, driverRequestParams);

    // TODO: ??? getUrlParams
    return this._main.$$stateManager.$$request.sendRequest(request, this.schema, this.getUrlParams());
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
