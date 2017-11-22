import _ from 'lodash';

import { correctUpdatePayload, omitUnsaveable } from '../helpers';
import _Action from './_Action';
import State from './State';


export default class Document extends State {
  static validateSchema(schema, schemaPath) {
    if (!_.isPlainObject(schema.schema)) {
      return `Schema definition of document on "${schemaPath}" must has a "schema" param!`;
    }
  }

  constructor(main) {
    super(main);
  }

  get type() {
    return 'document';
  }

  get loading() {
    return this.actions.load.pending || false;
  }

  get saving() {
    return this.actions.put.pending || this.actions.patch.pending || false;
  }

  $init(paths, schema) {
    super.$init(paths, schema);

    this.actions = {
      load: this._generateLoadAction(),
      put: this._generatePutAction(),
      patch: this._generatePatchAction(),
      remove: this._generateRemoveAction(),
    };

    // this.actionDefaults = {};
    // this._initActions();
  }

  load() {
    return this.actions.load.request();
  }
  put(payload) {
    return this.actions.put.request(payload);
  }
  patch(payload) {
    return this.actions.patch.request(payload);
  }
  remove() {
    return this.actions.remove.request();
  }


  update(newState, eventData=undefined) {
    // const lastChanges = correctUpdatePayload(
    //   this._main.$$stateManager.getMeta(this._moldPath, 'lastChanges', action), newState);
    // this._main.$$stateManager.updateMeta(this._moldPath, { lastChanges }, action);

    // TODO: use action load|default
    // TODO: use super.update

    //this._main.$$stateManager.updateTopLevel(this._moldPath, newState, 'default');

    super.update(newState, eventData);
  }

  // getUrlParams() {
  //   // TODO: use storage meta
  //   // TODO: по идее на каждый запрос надо сохранять свои url params
  //   return this._main.$$state.getUrlParams(this._moldPath);
  // }
  //
  // setUrlParams(params) {
  //   // TODO: use storage meta
  //   this._main.$$state.setUrlParams(this._moldPath, params);
  // }


  // TODO: updateSilent

  _createAction(actionName, cb) {
    const ActionClass = cb(_Action);

    const instance =  new ActionClass(this._main.$$stateManager, this, this._moldPath, actionName);
    instance.init();

    return instance;
  }

  _generateLoadAction() {
    return this._createAction(undefined, (Action) => {
      return class extends Action {
        init() {
          this.setDriverParams({
            method: 'get',
          });
        }
      };
    });
  }

  _generatePutAction() {
    return this._createAction('put', (Action) => {
      return class extends Action {
        init() {
          this.setDriverParams({
            method: 'put',
          });
        }

        request(...params) {
          // if we set new data - update default action
          if (params.payload) this.update(params.payload);

          return super.request(...params);
        }
      };
    });
  }

  _generatePatchAction() {
    return this._createAction('patch', (Action) => {
      return class extends Action {
        init() {
          this.setDriverParams({
            method: 'patch',
          });
        }

        request(...params) {
          // if we set new data - update default action
          if (params.payload) this.update(params.payload);

          return super.request(...params);
        }
      };
    });
  }


  _generateRemoveAction() {
    // TODO: test it, доделать
    return this._createAction('delete', (Action) => {
      return class extends Action {
        init() {
          this.setDriverParams({
            method: 'delete',
          });
        }
      };
    });
  }

  // /**
  //  * Delete a document via documentsCollection.
  //  * You can't remove document that not inside a collection.
  //  * @param {object} preRequest
  //  * @return {Promise}
  //  */
  // $remove(preRequest=undefined) {
  //   const myDocumentsCollection = this.getParent();
  //
  //   if (!myDocumentsCollection)
  //     this._main.$$log.fatal(`You can remove only from DocumentsCollection`);
  //
  //   if (myDocumentsCollection.type != 'documentsCollection')
  //     this._main.$$log.fatal(`The parent of document isn't a DocumentsCollection. You can remove only from DocumentsCollection`);
  //
  //   return myDocumentsCollection.remove(this.mold, preRequest);
  // }

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

  // _initActions() {
  //   _.each(this.schema.action, (item, name) => {
  //     if (_.isFunction(item)) {
  //       // custom method or overwrote method
  //       this.action[name] = (...params) => item.bind(this)(...params, this);
  //     }
  //     else if (_.isPlainObject(item)) {
  //       // Default acton's params
  //       this.actionDefaults[name] = item;
  //     }
  //   });
  // }

}
