import _ from 'lodash';

import { eachSchema } from './helpers/helpers';


export default class _Mold {
  constructor(main, moldPath, actionName, fullSchema) {
    this._main = main;
    this._moldPath = moldPath;
    this._actionName = actionName;
    // TODO: move to init
    this._schema = fullSchema;
  }

  get state() {
    return this._main.$$storage.getCombined(this._moldPath, this._actionName);
  }

  init() {
    this._initSchema();
    //this.__readOnlyProps = this._collectRoProps();
  }

  // clear() {
  //   const initialValues = this._getPrimitivesInitialStates();
  //   this.update(initialValues);
  // }

  setSilent(newState) {
    // TODO: test
    const correctValues = this._main.$$typeManager.castData(this._schema, newState);

    this._checkForUpdateReadOnly(newState);
    this._main.$$storage.setTopLevelSilent(this._moldPath, this._actionName, correctValues);
  }

  /**
   * Update top level state.
   * It casts values before update.
   * @param {object, array} newState - it's plain object or collection
   */
  update(newState) {
    const correctValues = this._main.$$typeManager.castData(this._schema, newState);

    this._checkForUpdateReadOnly(newState);
    this._main.$$storage.updateTopLevel(this._moldPath, this._actionName, correctValues);
  }

  /**
   * Update top level state silently
   * It casts values before update.
   * @param {object, array} newState - it's plain object or collection
   */
  updateSilent(newState) {
    const correctValues = this._main.$$typeManager.castData(this._schema, newState);

    this._checkForUpdateReadOnly(newState);
    this._main.$$storage.updateTopLevelSilent(this._moldPath, this._actionName, correctValues);
  }

  onChange(...params) {
    this._main.$$storage.onChange(this._moldPath, this._actionName, ...params);
  }

  onAnyChange(...params) {
    this._main.$$storage.onAnyChange(this._moldPath, this._actionName, ...params);
  }

  off(...params) {
    this._main.$$storage.off(this._moldPath, this._actionName, ...params);
  }

  destroy() {
    this._main.$$storage.destroy(this._moldPath, this._actionName);
  }

  _initSchema() {
    let initialState = this._getRootInitialState();

    // init primitives
    if (_.isPlainObject(initialState)) {
      initialState = this._getPrimitivesInitialStates();
    }

    this._main.$$storage.initState(this._moldPath, this._actionName, initialState);
  }

  _getRootInitialState() {
    const rootTypeName = this._schema.type;

    if (!_.includes([ 'assoc', 'collection' ], rootTypeName)) {
      this._main.$$log.fatal(`Bad root type "${rootTypeName}" for "${this._moldPath}" action "${this._actionName}"`);
    }

    const rootType = this._main.$$typeManager.getType(rootTypeName);

    return rootType.getInitial();
  }

  _getPrimitivesInitialStates() {
    const result = {};
    const schema = this._schema.items || this._schema.item;

    _.each(schema, (item, name) => {
      if (!_.isUndefined(item.initial)) {
        // set initial value
        result[name] = item.initial;
      }
      else {
        // set default type's initial value
        result[name] = this._main.$$typeManager.getInitial(item.type);
      }
    });

    return result;
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

    return;

    // // TODO: do it recursively - support collections, assoc and arrays
    // //const forbiddenRoProps = _.intersection(_.keys(newState), this.__readOnlyProps);
    //
    // const forbiddenRoProps = [];
    //
    // // TODO: add support for collection
    //
    // if (!_.isEmpty(forbiddenRoProps)) {
    //   this._main.$$log.fatal(`You can't write to read only props ${JSON.stringify(forbiddenRoProps)}`);
    // }
  }

}
