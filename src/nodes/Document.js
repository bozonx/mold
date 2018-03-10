const _ = require('lodash');

//import { omitUnsaveable } from '../helpers/helpers';
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

    this.actions = {};

    const defaultActions = {
      [this.$defaultAction]: {
        method: 'get',
        ...this._schema.actions && this._schema.actions[this.$defaultAction],
      },
      put: {
        method: 'put',
        beforeRequest: (params, action) => {
          if (!_.isUndefined(params.payload)) {
            // update default and path actions
            this.actions[this.$defaultAction].setSilent(params.payload);
            action.setSilent(params.payload);
          }
        },
        // set new data to default action
        afterRequest: (resp) => this.actions[this.$defaultAction].setSolidLayer(resp.body),
        ...this._schema.actions && this._schema.actions.put,
      },
      patch: {
        method: 'patch',
        beforeRequest: (params, action) => {
          if (!_.isUndefined(params.payload)) {
            // update default and path actions
            this.updateSilent(params.payload);
            action.updateSilent(params.payload);
          }
        },
        // set new data to default action
        afterRequest: (resp) => this.actions[this.$defaultAction].setSolidLayer(resp.body),
        ...this._schema.actions && this._schema.actions.patch,
      },
      remove: {
        method: 'delete',
        ...this._schema.actions && this._schema.actions.remove,
      },
    };

    this.$initActions(defaultActions);
  }

  load(params) {
    return this.actions[this.$defaultAction].request(params);
  }
  // put(payload) {
  //   return this.actions.put.request(payload);
  // }
  // patch(payload) {
  //   return this.actions.patch.request(payload);
  // }
  // remove() {
  //   return this.actions.remove.request();
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

};
