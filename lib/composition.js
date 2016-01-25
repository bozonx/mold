var _ = require('lodash');

class Composition {
  constructor () {
    // TODO: first level is only plain object, not array
    this._composition = {};
  }

  // Set composition part is only for internal use
  // Set value is very silent
  //$set (path, data) {
  //  // TODO: do it
  //}


  // Return value by path or undefined if it doesn't will be find
  // It return immutable object
  getValue (path) {
    // TODO: return immutable
    return (path) ? _.get(this._composition, path) : this._composition;
  }

  setValue (path, value) {
    // TODO: add silent
    // TODO: поддержка установки корня
    if (this._validateValue(path, value)) {
      // TODO: add rise set event
      // TODO: нельзя переписывать существующие объекты и массивы - нужно добавлять туда параметры, не затрагивая родителя
      // TODO: в value может быть целая ветвь, нужно её накладывать, так чтобы не переписать объекты и массивы
      _.set(this._composition, path, value);
    }
  }





  // validate value. Check it type and validate rules.
  // on error write console.error and return false
  _validateValue (path, value) {
    // TODO: find соотвествующий schema, run type validation and правила валидации на текущем узле
    // TODO: check value на соответствие схеме. - вывести ошибки не соответствия
    // TODO: нельзя добавлять/удалять узлы в struct - это должна проверить её ф-я валидации
    // TODO: если в value целая ветвь, то нужно проверять её
    return true;
  }

  // Reset schema. Only for tests
  $$reset () {
    this._composition = {};
  }
}

module.exports = new Composition();
