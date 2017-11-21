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
    if (!moldPath) throw new Error(`ERROR: moldPath is empty`);

    // TODO: проверить путь

    return this._getCombined(moldPath);
  }

  /**
   * Update partly top level data.
   * @param {string} moldPath
   * @param {object} partialData
   */
  updateTopLevel(moldPath, partialData) {
    this._update(moldPath, partialData);

    this._events.emit(moldPath, 'change', {
      data: partialData,
      by: 'user',
    });
    this._events.emit(moldPath, 'any', {
      data: partialData,
      by: 'user',
    });
  }

  updateTopLevelSilent(moldPath, partialData) {
    this._update(moldPath, partialData);

    this._events.emit(moldPath, 'silent', {
      data: partialData,
      by: 'program',
    });
    this._events.emit(moldPath, 'any', {
      data: partialData,
      by: 'program',
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

    this._events.emit(moldPath, 'bottom', {
      data: newData,
      by: 'program',
    });
    this._events.emit(moldPath, 'any', {
      data: newData,
      by: 'program',
    });
  }

  _update(moldPath, partialData) {
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

      // TODO: не поднимать события если не было изменений
      // TODO: впринципе не обязательно делать mutate - можно просто заменить, но правильно обработать массивы
      const wereChanges = mutate(currentData, '').update(partialData);

      // TODO: делать мутацию
      //this._storage.topLevel[moldPath] = _.defaultsDeep(_.cloneDeep(partialData), currentData);
    }
  }

  /**
   * Get combined top and bottom levels.
   * @param {string} moldPath
   * @private
   */
  _getCombined(moldPath) {
    const top = this._storage.topLevel[moldPath];
    const bottom = this._storage.bottomLevel[moldPath];

    // return undefined if there isn't any data
    if (_.isUndefined(top) && _.isUndefined(bottom)) return;

    // TODO: смержить с учетом массивов
    return _.defaultsDeep(_.cloneDeep(top), bottom );
  }

}
