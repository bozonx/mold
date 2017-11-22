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
    this._storage.items = {}
  }

  $getWholeStorageState() {
    return this._storage;
  }


  getNode(moldPath) {
    // TODO: test it
    if (!moldPath) throw new Error(`ERROR: moldPath is empty`);

    // TODO: проверить moldPath

    return this._storage.items[moldPath];
  }

  /**
   * Get merged levels
   * @param {string} moldPath
   * @param {string} action
   */
  getState(moldPath, action) {
    if (!moldPath) throw new Error(`ERROR: moldPath is empty`);

    // TODO: проверить moldPath

    return this._getCombined(moldPath, action);
  }

  getMeta(moldPath, metaPath, action) {
    // TODO: test it

    if (!this._storage.items[moldPath]) return;

    if (action) {
      return _.get(this._storage.items[moldPath].actions[action].meta, metaPath);
    }
    else {
      return _.get(this._storage.items[moldPath].meta, metaPath);
    }
  }

  initNodeIfNeed(moldPath) {
    if (this._storage.items[moldPath]) return;

    this._storage.items[moldPath] = {
      state: {},
      solid: {},
      meta: {},
    };
  }

  initActionIfNeed(moldPath, action) {
    // it's not need to create default action
    if (!action) return;

    if (this._storage.items[moldPath]
      && this._storage.items[moldPath].actions
      && this._storage.items[moldPath].actions[action]) return;

    if (!this._storage.items[moldPath].actions) {
      this._storage.items[moldPath].actions = {};
    }

    this._storage.items[moldPath].actions[action] = {
      state: {},
      solid: {},
      meta: {},
    };
  }

  /**
   * Update partly top level data.
   * @param {string} moldPath
   * @param {object} partialData
   * @param {string} action
   */
  updateTopLevel(moldPath, partialData, action) {
    this._update(moldPath, 'state', partialData, action);

    this._events.emit(moldPath, 'change', {
      data: partialData,
      by: 'user',
      action,
    });
    this._events.emit(moldPath, 'any', {
      data: partialData,
      by: 'user',
      action,
    });
  }

  updateTopLevelSilent(moldPath, partialData, action) {
    this._update(moldPath, 'state', partialData, action);

    this._events.emit(moldPath, 'silent', {
      data: partialData,
      by: 'program',
      action,
    });
    this._events.emit(moldPath, 'any', {
      data: partialData,
      by: 'program',
      action,
    });
  }

  updateMeta(moldPath, partialData, action) {
    // TODO: test it
    this._update(moldPath, 'meta', partialData, action);
    // TODO: поднимать ли событие any???
  }

  /**
   * Replace data of bottom level and rise silent event.
   * @param {string} moldPath
   * @param {object} newData
   * @param {string} action
   */
  setBottomLevel(moldPath, newData, action) {
    if (!moldPath) throw new Error(`ERROR: path is empty`);

    this.initNodeIfNeed(moldPath);
    this.initActionIfNeed(moldPath, action);

    // TODO: проверить путь
    // TODO: ??? делать мутацию
    if (action) {
      this._storage.items[moldPath].actions[action].solid = newData;
    }
    else {
      this._storage.items[moldPath].solid = newData;
    }

    this._events.emit(moldPath, 'bottom', {
      data: newData,
      by: 'program',
      action,
    });
    this._events.emit(moldPath, 'any', {
      data: newData,
      by: 'program',
      action,
    });
  }

  _update(moldPath, subPath, partialData, action) {
    if (!moldPath) throw new Error(`ERROR: path is empty`);
    // TODO: проверить путь
    // TODO: !!!

    this.initNodeIfNeed(moldPath);
    this.initActionIfNeed(moldPath, action);

    let currentData;
    if (action) {
      currentData = this._storage.items[moldPath].actions[action][subPath];
    }
    else {
      currentData = this._storage.items[moldPath][subPath];
    }

    // merge

    // TODO: не поднимать события если не было изменений
    // TODO: впринципе не обязательно делать mutate - можно просто заменить, но правильно обработать массивы
    const wereChanges = mutate(currentData, '').update(partialData);

    // TODO: ???? делать мутацию
    //this._storage.topLevel[moldPath] = _.defaultsDeep(_.cloneDeep(partialData), currentData);
  }

  /**
   * Get combined top and bottom levels.
   * @param {string} moldPath
   * @param {string} action
   * @private
   */
  _getCombined(moldPath, action) {
    let top;
    let bottom;

    if (action) {
      top = this._storage.items[moldPath].actions[action].state;
      bottom = this._storage.items[moldPath].actions[action].solid;
    }
    else {
      top = this._storage.items[moldPath].state;
      bottom = this._storage.items[moldPath].solid;
    }

    // return undefined if there isn't any data
    if (_.isUndefined(top) && _.isUndefined(bottom)) return;

    // TODO: смержить с учетом массивов
    return _.defaultsDeep(_.cloneDeep(top), bottom );
  }

}
