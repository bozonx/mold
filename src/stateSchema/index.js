//import 'source-map-support/register';
//require('source-map-support').install();


import SchemaManager from './SchemaManager';
import State from './State';
import ItemInstance from './ItemInstance';
//import ListInstance from './ListInstance';


class MainInstance {
  constructor(schema) {
    this._schemaManager = new SchemaManager();
    this._state = new State();
    this._schemaManager.init(schema, this._state);
    this._state.init(this._schemaManager);

    // initialize all handlers, setup default values
    //this._schemaManager.initHandlers();
  }

  // /**
  //  * get current runtime value
  //  * @param path
  //  * @returns {object} promise
  //  */
  // get(path) {
  //   return this._state.getValue(path);
  // }
  //
  // /**
  //  * Is has a path
  //  * @param path
  //  * @returns {boolean}
  //  */
  // has(path) {
  //   return this._state.hasValue(path);
  // }
  //
  // /**
  //  * set runtime value
  //  * @param {string} path
  //  * @param {mixed} value
  //  * @returns {object} promise
  //  */
  // set(path, value) {
  //   return this._state.setValue(path, value);
  // }

  /**
   * set runtime value silently
   * @param {string} path
   * @param {*} value
   * @returns {object} promise
   */
  setSilent(path, value) {
    return this._state.setSilent(path, value);
  }

  /**
   * Get list or item instance on path
   * @param {string} path
   */
  instance(path) {
    // TODO: выбрать list или item
    return new ItemInstance(path, this._state, this._schemaManager);
  }
}


// TODO: добавить возможность вставлять в стейт полный сохраненный стейт - initialState - для тестов и загрузки с сервера
// TODO: добавить события
// TODO: добавить списки

// TODO: синхронные / асинхронные запросы - async await
// TODO: сделать pounch
// TODO: сделать localStorage

// TODO: сделать валидацию параметров
// TODO: сделать валидацию схемы
// TODO: forceUpdate - обновить данные с сервера - либо использовать silent


export function initSchema(schema) {
  return new MainInstance(schema);
}



// export function list(itemSchema) {
//   return {
//     type: 'list',
//     itemSchema: itemSchema,
//   }
// }
