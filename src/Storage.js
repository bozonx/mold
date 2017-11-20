import _ from 'lodash';

import { concatPath } from './helpers';
import { mutate, updateIndexes } from './mutate';


export default class Storage {
  constructor(events, log) {
    this._events = events;
    this._log = log;
    this._storage = null;
  }

  /**
   * Set new storage.
   * This method runs one time from State.js.
   * Don't run it from your application.
   * @param {object} newStorage
   */
  $init(newStorage) {
    this._storage = newStorage;
    this._storage.topLevel = {};
    this._storage.bottomLevel = {};
    this._storage.meta = {};
  }

  $getWholeStorageState() {
    return this._storage;
  }

  /**
   * Get merged levels
   * @param {string} moldPath
   */
  get(moldPath) {
    if (!moldPath) throw new Error(`ERROR: path is empty`);
    // TODO: проверить путь
    // TODO: если нет ничего - возвращать undefined
    // TODO: !!!
  }

  /**
   * Update partly top level data.
   * @param {string} moldPath
   * @param {object} partialData
   */
  updateTopLevel(moldPath, partialData) {
    if (!moldPath) throw new Error(`ERROR: path is empty`);
    // TODO: проверить путь
    // TODO: !!!
  }

  /**
   * Replace data of bottom level and rise silent event.
   * @param {string} moldPath
   * @param {object} newData
   */
  setBottomLevel(moldPath, newData) {
    if (!moldPath) throw new Error(`ERROR: path is empty`);
    // TODO: проверить путь
    // TODO: делать мутацию
    this._storage.bottomLevel[moldPath] = newData;
  }

  /**
   * Get combined top and bottom levels.
   * @param {string} moldPath
   * @private
   */
  _getCombined(moldPath) {
    // TODO: !!!
  }

}
