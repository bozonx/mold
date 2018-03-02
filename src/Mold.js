const _ = require('lodash');
const { eachPrimitiveSchema } = require('./helpers/helpers');


module.exports = class _Mold {
  constructor(main, moldPath, actionName, primitiveSchema) {
    this._main = main;
    this._moldPath = moldPath;
    this._actionName = actionName;
    this._primitiveSchema = primitiveSchema;
  }

  get state() {
    return this._main.storage.getCombined(this._moldPath, this._actionName);
  }

  init() {
    if (!this._main.storage.isActionInited(this._moldPath, this._actionName)) {
      this._initActionStorage();
    }
  }

  // clear() {
  //   const initialValues = this._getPrimitivesInitialStates();
  //   this.update(initialValues);
  // }

  /**
   * Replace mold state.
   * It casts and validates values before update.
   * @param {object|array} newState - full mold stat to set.
   */
  setSilent(newState) {
    const correctValues = this._main.typeManager.castValue(this._primitiveSchema, newState);
    this._checkValue(correctValues);

    this._main.storage.setStateLayerSilent(this._moldPath, this._actionName, correctValues);
  }

  /**
   * Update mold state. It usually calls on event of form field update by user.
   * It rises a 'change' event.
   * It casts and validates values before update.
   * @param {object|array} newPartlyState - part of mold state to update.
   */
  update(newPartlyState) {
    const correctValues = this._main.typeManager.castValue(this._primitiveSchema, newPartlyState);
    this._checkValue(correctValues);

    this._main.storage.updateStateLayer(this._moldPath, this._actionName, correctValues);
  }

  /**
   * Update mold state silently. It usually calls on programmatically updates (not by user).
   * It casts values before update.
   * @param {object|array} newPartlyState - part of mold state to update.
   */
  updateSilent(newPartlyState) {
    const correctValues = this._main.typeManager.castValue(this._primitiveSchema, newPartlyState);
    this._checkValue(correctValues);

    this._main.storage.updateStateLayerSilent(this._moldPath, this._actionName, correctValues);
  }

  onChange(handler) {
    this._main.storage.onChangeAction(this._moldPath, this._actionName, handler);
  }

  onAnyChange(handler) {
    this._main.storage.onAnyChangeAction(this._moldPath, this._actionName, handler);
  }

  off(eventName, handler) {
    this._main.storage.offAction(this._moldPath, this._actionName, eventName, handler);
  }

  destroy() {
    this._main.storage.destroy(this._moldPath, this._actionName);
  }

  _initActionStorage() {
    const initialContainer = this._getRootInitialState();
    this._main.storage.initAction(this._moldPath, this._actionName, initialContainer);

    const initialState = this._getPrimitivesInitialStates();
    // set initial values
    this._main.storage.setStateLayerSilent(this._moldPath, this._actionName, initialState);
  }

  _getRootInitialState() {
    const rootTypeName = this._primitiveSchema.type;

    if (!_.includes([ 'assoc', 'array' ], rootTypeName)) {
      this._main.log.fatal(`On mold path ${this._moldPath} action "${this._actionName}: Bad root type "${rootTypeName}"`);
    }

    return this._main.typeManager.getInitial(rootTypeName);
  }

  _getPrimitivesInitialStates() {
    let result;

    if (this._primitiveSchema.type === 'assoc') {
      result = {};

      if (!_.isUndefined(this._primitiveSchema.initial)) {
        // use root initial
        result = this._primitiveSchema.initial;
      }

      // find initial values deeply in schema. They owerwrites root initial values
      result = _.defaultsDeep(this._collectAssocInitial(), result);

    }
    else if (this._primitiveSchema.type === 'array') {
      result = this._primitiveSchema.initial || [];
    }


    return result;
  }

  _collectAssocInitial() {
    const result = {};

    eachPrimitiveSchema(this._primitiveSchema, (curMoldPath, curSchemaPath, curSchema) => {
      if (!_.isUndefined(curSchema.initial)) {
        // get schema's initial value which has validated previously on schema init time
        _.set(result, curMoldPath, curSchema.initial);

        return;
      }

      // set default initial value of type
      _.set(result, curMoldPath, this._main.typeManager.getInitial(curSchema.type));
    });

    return result;
  }

  /**
   * Check value and trow an error if it is invalid or read only.
   * @param {array|object|null} correctValues - casted values.
   * @private
   */
  _checkValue(correctValues) {
    // validate normalized values. It trows an error if state isn't valid.
    const validMsg = this._main.typeManager.validateValue(this._primitiveSchema, correctValues);
    if (validMsg) {
      this._main.log.fatal(`On mold path ${this._moldPath} action "${this._actionName}: Invalid data ${JSON.stringify(correctValues)}. ${validMsg}`);
    }

    this._checkForUpdateReadOnly(correctValues);
  }


  _checkForUpdateReadOnly(newState) {
    // TODO: test collection
    const recursively = (containerState, containerSchema) => {
      if (containerSchema.type === 'assoc') {
        // each assoc item
        _.each(containerState, (item, name) => {
          // if state don't have schema - do nothing
          if (!containerSchema.items[name]) return;

          if (_.includes([ 'assoc', 'array' ], containerSchema.items[name].type)) {
            // if container - go deeper
            recursively(item, containerSchema.items[name]);
          }
          else {
            // primitive type - check for read only
            if (!containerSchema.items[name].ro) return;
            // disallow to write read only state
            this._main.log.fatal(`You can't write to read only props ${JSON.stringify(newState)}`);
          }
        });
      }
      else if (containerSchema.type === 'array') {
        _.each(containerState, (arrItem) => {
          // go deeper
          recursively(arrItem, containerSchema.item);
        });
      }
    };

    recursively(newState, this._primitiveSchema);
  }

};
