// TODO: добавить события
// TODO: добавить списки
// TODO: сделать ParamInstance - это обчный, item это контейнер
// TODO: всегда возвращаем инстансы на get, но у инстанса будет loadPromise - который выполнится когда данные загрузятся

// TODO: синхронные / асинхронные запросы - async await
// TODO: сделать pounch
// TODO: сделать localStorage

// TODO: сделать валидацию параметров
// TODO: сделать валидацию схемы
// TODO: forceUpdate - обновить данные с сервера - либо использовать silent

import SchemaManager from './SchemaManager';
import State from './State';

class MainInstance {
  constructor(schema) {
    this._schemaManager = new SchemaManager();
    this._state = new State();
    this._schemaManager.init(schema, this._state);
    this._state.init(this._schemaManager);

    // initialize all handlers
    //this._schemaManager.initHandlers();
  }

  /**
   * Get all current runtime state
   * @param {string} path - path to a state. To get root, pass ''
   * @returns {object} state
   */
  getState(path) {
    return this._state.getValue(path);
  }

  /**
   * Set all initial values. Work mode:
   *    setSilent(value) - pass values to root
   *    setSilent(path, value) - pass values to path
   * It silently setup a state.
   */
  initState(param1, param2) {
    var path = param1;
    var value = param2;
    if (!param2) {
      path = '';
      value = param1;
    }
    this._state.setSilent(path, value);
  }

  /**
   * Get list or item or container instance by a path
   * @param {string} path - absolute path
   * @returns {object} - instance of param or list or container
   */
  instance(path) {
    return this._schemaManager.getInstance(path);
  }
}

export function initSchema(schema) {
  return new MainInstance(schema);
}
