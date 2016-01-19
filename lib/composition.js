var _ = require('lodash');

class Composition {
  constructor () {
    // TODO: first level is only plain object, not array
    this._composition = {};
  }

  // Set composition part is only for internal use
  //$setComposition () {
  //
  //}

  setValue (path, value) {
    // TODO: add silent
    // TODO: нельзя переписывать существующие объекты и массивы - нужно добавлять туда параметры, не затрагивая родителя
    if (this._validateValue(value)) {
      // TODO: add rise set event
      _.set(this._composition, path, value);
    }
  }

  // Return value by path or undefined if it doesn't will be find
  getValue (path) {
    return _.get(this._composition, path);
  }

  // Set value is very silent
  $set (path, data) {
    // TODO: do it
  }


  _validateValue (value) {
    // TODO: check value на соответствие схеме. - вывести ошибки не соответствия
    return true;
  }
}

var composition = new Composition();
module.exports = composition;
