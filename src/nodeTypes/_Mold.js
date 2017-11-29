import _ from 'lodash';

import { eachSchema } from '../helpers';


export default class _Mold {
  constructor(main, moldPath, actionName, fullSchema) {
    this._main = main;
    this._moldPath = moldPath;
    this._actionName = actionName;
    this._schema = fullSchema;
  }

  get state() {
    return this._main.$$storage.getCombined(this._moldPath, this._actionName);
  }

  init() {
    this._initSchema();
    // this.__readOnlyProps = [];
    // _.each(this.schema.schema, (item, name) => {
    //   if (item.readOnly) this.__readOnlyProps.push(name);
    // });
  }

  update(newState) {
    const isValid = this._validate(newState);

    if (isValid !== true) {
      console.error(isValid);

      return;
    }

    //this._checkForUpdateReadOnly(newState);
    this._main.$$storage.updateTopLevel(this._moldPath, this._actionName, newState);
  }

  updateSilent(newState) {
    const isValid = this._validate(newState);

    if (isValid !== true) {
      this._main.$$log.error(isValid);

      return;
    }

    //this._checkForUpdateReadOnly(newState);
    this._main.$$storage.updateTopLevelSilent(this._moldPath, this._actionName, newState);
  }

  _initSchema() {
    const initialState = this._getInitialState();
    this._main.$$storage.initState(this._moldPath, this._actionName, initialState);
  }

  _getInitialState() {
    const rootTypeName = this._schema.type;

    if (!_.includes(['assoc', 'collection'], rootTypeName)) {
      this._main.$$log.fatal(`ERROR: bad root type "${rootTypeName}" for "${this._moldPath}" action "${this._actionName}"`);
    }

    const rootType = this._main.$$typeManager.types[rootTypeName];

    return rootType.getInitial();
  }

  _validate(newState) {
    // TODO: валидировать согласно схеме
    // TODO: do it. return string on error
    return true;

    eachSchema(this._schema, (schemaPath, schema) => {

    });
  }

  // _checkForUpdateReadOnly(newState) {
  //   const forbiddenRoProps = _.intersection(_.keys(newState), this.__readOnlyProps);
  //
  //   if (!_.isEmpty(forbiddenRoProps)) {
  //     this._main.$$log.fatal(`You can't write to read only props ${JSON.stringify(forbiddenRoProps)}`);
  //   }
  // }


}
