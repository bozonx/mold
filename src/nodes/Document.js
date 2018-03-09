const _ = require('lodash');
const { Map } = require('immutable');

//import { correctUpdatePayload, omitUnsaveable } from '../helpers/helpers';
const NodeBase = require('./_NodeBase');


module.exports = class Document extends NodeBase {
  static validateSchema(schema, schemaPath) {
    // TODO: может переименовать в items?
    if (!_.isPlainObject(schema.schema)) {
      return `The definition of "document" node on "${schemaPath}" must has a "schema"!`;
    }
    else if (schema.schema.type) {
      return `Schema definition of "document" node on "${schemaPath}" must not to have a "type" param! It has to be just plain object.`;
    }
  }

  get type() {
    return 'document';
  }

  get isLoading() {
    return this.actions[this.$defaultAction].pending;
  }

  get isSaving() {
    return this.actions.put.pending || this.actions.patch.pending;
  }

  $init(moldPath, schema) {
    super.$init(moldPath, schema);

    // params for all the actions
    this._urlParams = {};
    this._driverParams = {};

    // convert to simple schema type
    this.$primitiveSchema = {
      type: 'assoc',
      items: schema.schema,
    };

    this.actions = {
      // TODO: передать вмесет с custom actions в _initActions
      // TODO: переделать на action params
      // 'default': this.$generateDefaultAction(),
      // put: this._generatePutAction(),
      // patch: this._generatePatchAction(),
      // remove: this._generateRemoveAction(),
    };

    this._initActions();
  }

  params(urlParams, driverParams) {
    this._urlParams = _.cloneDeep(urlParams);
    this._driverParams = _.cloneDeep(driverParams);
  }

  load() {
    return this.actions.default.request();
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

  $generateDefaultAction() {
    return this.$createAction(this.$defaultAction, (Action) => {
      return class extends Action {
        init() {
          super.init();
          this.setDriverParams({ method: 'get' });
        }
      };
    });
  }

  _generatePutAction() {
    const document = this;

    return this.$createAction('put', (Action) => {
      return class extends Action {
        init() {
          super.init();
          this.setDriverParams({ method: 'put' });
        }

        request(payload) {
          // if we set new data - update default action
          if (payload) {
            // set to put action
            this.setSilent(payload);
            // set to default action
            document.actions.default.setSilent(payload);
          }

          return super.request(payload)
            .then((resp) => {
              // TODO: тут clear не правильно работает - нужно очистить только то что придетс с сервера
              //document.actions.default.clearStateLayer();
              document.actions.default.setSolidLayer(resp.body);

              return resp;
            });
        }
      };
    });
  }

  _generatePatchAction() {
    const document = this;

    return this.$createAction('patch', (Action) => {
      return class extends Action {
        init() {
          super.init();
          this.setDriverParams({ method: 'patch' });
        }

        request(payload) {
          // if we set new data - update default action
          if (payload) {
            // update path action
            this.updateSilent(payload);
            // update default action
            document.actions.default.updateSilent(payload);
          }

          return super.request(payload)
            .then((resp) => {
              //document.actions.default.clearStateLayer();
              document.actions.default.setSolidLayer(resp.body);

              return resp;
            });
        }
      };
    });
  }


  _generateRemoveAction() {
    // TODO: test it, доделать
    return this.$createAction('delete', (Action) => {
      return class extends Action {
        init() {
          super.init();
          this.setDriverParams({ method: 'delete' });
        }
      };
    });
  }

  _initActions() {
    _.each(this.schema.actions, (actionParams, actionName) => {
      this.actions[actionName] = this.$createAction(
        actionName,
        actionParams,
        this._urlParams,
        this._driverParams
      );
      // double to root of document for more convenience
      this[actionName] = this.actions[actionName];
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
  //     this._main.log.fatal(`You can remove only from DocumentsCollection`);
  //
  //   if (myDocumentsCollection.type != 'documentsCollection')
  //     this._main.log.fatal(`The parent of document isn't a DocumentsCollection. You can remove only from DocumentsCollection`);
  //
  //   return myDocumentsCollection.remove(this.mold, preRequest);
  // }

  // _applyDefaults(preRequest, actionName) {
  //   if (!this.actionDefaults[actionName]) return preRequest;
  //
  //   return _.defaultsDeep(_.cloneDeep(preRequest), this.actionDefaults[actionName]);
  // }

};
