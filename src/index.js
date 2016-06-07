// TODO: сделать pounch
// TODO: добавить события
// TODO: синхронные / асинхронные запросы - async await

// TODO: сделать localStorage
// TODO: сделать url state
// TODO: сделать конфигурацию - где можно задать параметры для pounch и тд

// TODO: сделать тест всего - разные операции - одни результат
// TODO: сделать валидацию параметров
// TODO: сделать валидацию схемы
// TODO: forceUpdate - обновить данные с сервера - либо использовать silent

import Composition from './Composition';
import SchemaManager from './SchemaManager';
import State from './State';

class MainInstance {
  constructor(schema) {
    this._composition = new Composition();
    this._schemaManager = new SchemaManager();
    this._state = new State();
    
    this._schemaManager.init(schema, this._state);
    this._state.init(this._schemaManager, this._composition);

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
