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

    return this._getCombined(moldPath);
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

    const currentData = this._storage.topLevel[moldPath];

    if (_.isUndefined(currentData)) {
      // create first data
      this._storage.topLevel[moldPath] = partialData;
    }
    else {
      // merge
      // TODO: делать мутацию
      this._storage.topLevel[moldPath] = _.defaultsDeep(_.cloneDeep(partialData), currentData);
    }

    // TODO: поднимать ещё и any change
    this._events.emit(moldPath, 'change', {
      data: partialData,
      by: 'user',
    });
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

    // TODO: поднимать ещё и any change
    this._events.emit(moldPath, 'silent', {
      data: newData,
      by: 'program',
    });
  }

  /**
   * Get combined top and bottom levels.
   * @param {string} moldPath
   * @private
   */
  _getCombined(moldPath) {
    // TODO: если нет ничего - возвращать undefined

    // TODO: смержить с учетом массивов
    return _.defaultsDeep(_.cloneDeep(this._storage.topLevel[moldPath]), this._storage.bottomLevel[moldPath] );
  }

}
