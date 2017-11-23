
export default class _Mold {
  constructor(stateManager, moldPath, action, schema) {
    this._stateManager = stateManager;
    this._moldPath = moldPath;
    this._action = action;
    this._schema = schema;
    this._state = undefined;
  }

  get state() {
    return this._state;
  }

  init() {
    // TODO: берем корневой элемент и инициализируем его и берем у него mold
    //this._state;

    // this.__readOnlyProps = [];
    // _.each(this.schema.schema, (item, name) => {
    //   if (item.readOnly) this.__readOnlyProps.push(name);
    // });
  }

  update(newState, eventData=undefined) {
    //this._checkForUpdateReadOnly(newState);
    this._stateManager.updateTopLevel(this._moldPath, this._action, newState, eventData);
  }

  updateSilent(newState, eventData=undefined) {
    //this._checkForUpdateReadOnly(newState);
    this._stateManager.updateTopLevel(this._moldPath, this._action, newState, eventData);
  }


  // _checkForUpdateReadOnly(newState) {
  //   const forbiddenRoProps = _.intersection(_.keys(newState), this.__readOnlyProps);
  //
  //   if (!_.isEmpty(forbiddenRoProps)) {
  //     this._main.$$log.fatal(`You can't write to read only props ${JSON.stringify(forbiddenRoProps)}`);
  //   }
  // }


}
