import _ from 'lodash';

import { eachSchema } from '../helpers';


export default class _Mold {
  constructor(storage, typeManager, moldPath, actionName, fullSchema) {
    this._storage = storage;
    this._typeManager = typeManager;
    this._moldPath = moldPath;
    this._actionName = actionName;
    this._schema = fullSchema;
    this._state = undefined;

    // TODO: set moldTransform to storage
  }

  get state() {
    return this._state;
  }

  init() {
    this._initSchema();
    // this.__readOnlyProps = [];
    // _.each(this.schema.schema, (item, name) => {
    //   if (item.readOnly) this.__readOnlyProps.push(name);
    // });
  }

  update(newState) {
    //this._checkForUpdateReadOnly(newState);
    // TODO: валидировать согласно схеме
    this._storage.updateTopLevel(this._moldPath, this._actionName, newState);
  }

  updateSilent(newState) {
    //this._checkForUpdateReadOnly(newState);
    // TODO: валидировать согласно схеме
    this._storage.updateTopLevel(this._moldPath, this._actionName, newState);
  }

  _initSchema() {
    // TODO: берем корневой элемент и инициализируем его и берем у него mold
    //this._state;

    const initialState = this._getInitialState();
    this._storage.initState(this._moldPath, this._actionName, initialState);

    eachSchema(this._schema, (schemaPath, schema) => {

    });
  }

  _getInitialState() {
    const rootTypeName = this._schema.type;

    if (_.includes(['assoc', 'collection'], rootTypeName)) {
      // TODO: use log
      throw new Error(`ERROR: bad root type "${rootTypeName}" for ${this._moldPath} ${this._actionName}`);
    }

    const rootType = this._typeManager.types[rootTypeName];

    return rootType.getInitial();
  }

  // _checkForUpdateReadOnly(newState) {
  //   const forbiddenRoProps = _.intersection(_.keys(newState), this.__readOnlyProps);
  //
  //   if (!_.isEmpty(forbiddenRoProps)) {
  //     this._main.$$log.fatal(`You can't write to read only props ${JSON.stringify(forbiddenRoProps)}`);
  //   }
  // }


}
