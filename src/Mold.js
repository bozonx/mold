import _ from 'lodash';

import { eachSchema } from './helpers/helpers';


export default class _Mold {
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
    this._readOnlyProps = this._collectRoProps();
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
    // TODO: test
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
    // TODO: test
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
    // TODO: review
    // TODO: массив тоже может иметь initial state

    if (this._primitiveSchema.type === 'assoc') {
    }
    else if (this._primitiveSchema.type === 'array') {
      // TODO: массив тоже может иметь initial state

    }

    const result = {};
    // get schema for document or catalogue
    const schema = this._primitiveSchema.items || this._primitiveSchema.item;

    _.each(schema, (item, name) => {
      if (!_.isUndefined(item.initial)) {
        // set initial value from schema
        result[name] = item.initial;

        return;
      }

      // set default initial value of type
      result[name] = this._main.typeManager.getInitial(item.type);
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

  _collectRoProps() {
    // TODO: test

    const roPropsPaths = [];

    if (this._primitiveSchema.type === 'assoc') {
      // collect from assoc
      eachSchema(this._primitiveSchema.items, (curMoldPath, curSchemaPath, curSchema) => {
        if (curSchema.ro) {
          roPropsPaths.push(curMoldPath);
        }
      });
    }
    else if (this._primitiveSchema.type === 'array') {
      // TODO: add support for collection

    }
    else {
      this._main.log.fatal(`On mold path ${this._moldPath} action "${this._actionName}: Invalid schema type ${this._primitiveSchema.type}`);
    }

    return roPropsPaths;
  }

  _checkForUpdateReadOnly(newState) {
    // TODO: проходимся по всем элементнам newState и сверяем со схемой, если assoc или collecton идем глубже


    // // TODO: do it recursively - support collections, assoc and arrays
    // //const forbiddenRoProps = _.intersection(_.keys(newState), this.__readOnlyProps);
    //
    // const forbiddenRoProps = [];
    //
    // // TODO: add support for collection
    //
    // if (!_.isEmpty(forbiddenRoProps)) {
    //   this._main.log.fatal(`You can't write to read only props ${JSON.stringify(forbiddenRoProps)}`);
    // }
  }

}
