import _ from 'lodash';

import { eachSchema } from './helpers/helpers';


export default class _Mold {
  constructor(main, moldPath, actionName, fullSchema) {
    this._main = main;
    this._moldPath = moldPath;
    this._actionName = actionName;
    // TODO: наверное имеется ввиду _primitiveSchema ?
    this._schema = fullSchema;
  }

  get state() {
    return this._main.storage.getCombined(this._moldPath, this._actionName);
  }

  init() {
    if (this._main.storage.getAction(this._moldPath, this._actionName)) {
      this._initActionStorage();
    }
    // this.__readOnlyProps = this._collectRoProps();
  }

  // clear() {
  //   const initialValues = this._getPrimitivesInitialStates();
  //   this.update(initialValues);
  // }

  setSilent(newState) {
    // TODO: test
    const correctValues = this._main.typeManager.castValue(this._schema, newState);
    this._checkValue(correctValues);

    this._main.storage.setStateLayerSilent(this._moldPath, this._actionName, correctValues);
  }

  /**
   * Update top level state.
   * It casts values before update.
   * @param {object, array} newState - it's plain object or collection
   */
  update(newState) {
    const correctValues = this._main.typeManager.castValue(this._schema, newState);
    this._checkValue(correctValues);

    this._main.storage.updateStateLayer(this._moldPath, this._actionName, correctValues);
  }

  /**
   * Update top level state silently
   * It casts values before update.
   * @param {object, array} newState - it's plain object or collection
   */
  updateSilent(newState) {
    const correctValues = this._main.typeManager.castValue(this._schema, newState);
    this._checkValue(correctValues);

    this._main.storage.updateStateLayerSilent(this._moldPath, this._actionName, correctValues);
  }

  onChange(...params) {
    this._main.storage.onChangeAction(this._moldPath, this._actionName, ...params);
  }

  onAnyChange(...params) {
    this._main.storage.onAnyChangeAction(this._moldPath, this._actionName, ...params);
  }

  off(...params) {
    this._main.storage.offAction(this._moldPath, this._actionName, ...params);
  }

  destroy() {
    this._main.storage.destroy(this._moldPath, this._actionName);
  }

  _initActionStorage() {
    const initialContainer = this._getRootInitialState();

    this._main.storage.initAction(this._moldPath, this._actionName, initialContainer);

    let initialState;
    // init primitives for document
    // TODO: массив тоже может иметь initial state
    if (_.isPlainObject(initialContainer)) {
      initialState = this._getPrimitivesInitialStates();
    }

    this._main.storage.setStateLayerSilent(this._moldPath, this._actionName, initialState);
  }

  _getRootInitialState() {
    const rootTypeName = this._schema.type;

    if (!_.includes([ 'assoc', 'array' ], rootTypeName)) {
      this._main.log.fatal(`On mold path ${this._moldPath} action "${this._actionName}: Bad root type "${rootTypeName}"`);
    }

    return this._main.typeManager.getInitial(rootTypeName);
  }

  _getPrimitivesInitialStates() {
    // TODO: review
    // TODO: массив тоже может иметь initial state

    const result = {};
    // get schema for document or catalogue
    const schema = this._schema.items || this._schema.item;

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
    const validMsg = this._main.typeManager.validateValue(this._schema, correctValues);
    if (validMsg) {
      this._main.log.fatal(`On mold path ${this._moldPath} action "${this._actionName}: Invalid data ${JSON.stringify(correctValues)}. ${validMsg}`);
    }

    this._checkForUpdateReadOnly(correctValues);
  }

  // _collectRoProps() {
  //   const roPropsPaths = [];
  //
  //   // collect from assoc
  //   eachSchema(this._schema.items, (curMoldPath, curSchemaPath, curSchema) => {
  //     if (curSchema.ro) {
  //       roPropsPaths.push(curMoldPath);
  //     }
  //   });
  //
  //   // TODO: add support for collection
  //
  //   return roPropsPaths;
  // }

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
