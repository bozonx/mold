import _ from 'lodash';

import { correctUpdatePayload, omitUnsaveable } from '../helpers';
import State from './State';


export default class Document extends State {
  static validateSchema(schema, schemaPath) {
    if (!_.isPlainObject(schema.schema)) {
      return `Schema definition of document on "${schemaPath}" must has a "schema" param!`;
    }
  }

  constructor(main) {
    super(main);

    this._defaultActionName = 'default';
  }

  get type() {
    return 'document';
  }

  get loading() {
    return this.actions.load.pending;
  }

  get saving() {
    return this.actions.put.pending || this.actions.patch.pending;
  }

  $init(moldPath, schema) {
    super.$init(moldPath, schema);

    this.actions = {
      load: this._generateLoadAction(),
      put: this._generatePutAction(),
      patch: this._generatePatchAction(),
      remove: this._generateRemoveAction(),
    };

    // this.actionDefaults = {};
    this._initCustomActions();
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

  _generateLoadAction() {
    return this.$createAction(this._defaultActionName, function (Action) {
      return class extends Action {
        init() {
          this._stateManager.initState(this._moldPath, {}, this._actionName);
          this.setDriverParams({
            method: 'get',
          });
        }
      };
    });
  }

  _generatePutAction() {
    return this.$createAction('put', (Action) => {
      return class extends Action {
        init() {
          this._stateManager.initState(this._moldPath, {}, this._actionName);
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
    return this.$createAction('patch', (Action) => {
      return class extends Action {
        init() {
          this._stateManager.initState(this._moldPath, {}, this._actionName);
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
    return this.$createAction('delete', (Action) => {
      return class extends Action {
        init() {
          this._stateManager.initState(this._moldPath, {}, this._actionName);
          this.setDriverParams({
            method: 'delete',
          });
        }
      };
    });
  }


  _initCustomActions() {
    _.each(this.schema.actions, (item, name) => {
      this.actions[name] = this.$createAction(name, item);

      // if (_.isFunction(item)) {
      //   // custom method or overwrote method
      //   this.action[name] = (...params) => item.bind(this)(...params, this);
      // }
      // else if (_.isPlainObject(item)) {
      //   // Default acton's params
      //   this.actionDefaults[name] = item;
      // }
    });
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

  // _applyDefaults(preRequest, actionName) {
  //   if (!this.actionDefaults[actionName]) return preRequest;
  //
  //   return _.defaultsDeep(_.cloneDeep(preRequest), this.actionDefaults[actionName]);
  // }

}
