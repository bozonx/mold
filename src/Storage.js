import _ from 'lodash';

import { concatPath } from './helpers';
import { mutate, updateIndexes } from './mutate';


export default class Storage {
  constructor(events) {
    this._events = events;
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

  initState(moldPath, action, initialState) {
    this._checkParams(moldPath, action);
    this.initActionIfNeed(moldPath, action);

    this._storage.items[moldPath][action].state = initialState;
  }

  initActionIfNeed(moldPath, action) {
    if (!this._storage.items[moldPath]) {
      this._storage.items[moldPath] = {};
    }

    if (!this._storage.items[moldPath][action]) {
      this._storage.items[moldPath][action] = {};
    }
  }

  getNode(moldPath) {
    if (!moldPath) throw new Error(`ERROR: moldPath is empty`);

    return this._storage.items[moldPath];
  }

  getCombined(moldPath, action) {
    // TODO: test it
    this._checkParams(moldPath, action);

    if (!this._storage.items[moldPath] || !this._storage.items[moldPath][action]) {
      return undefined;
    }

    return this._storage.items[moldPath][action].combined;
  }

  /**
   * Get merged levels
   * @param {string} moldPath
   * @param {string} action
   * @return {object|undefined}
   */
  getState(moldPath, action) {
    // TODO: test it
    this._checkParams(moldPath, action);

    if (!this._storage.items[moldPath] || !this._storage.items[moldPath][action]) {
      return undefined;
    }

    return this._storage.items[moldPath][action].state;
  }

  getSolid(moldPath, action) {
    // TODO: test it
    this._checkParams(moldPath, action);

    if (!this._storage.items[moldPath] || !this._storage.items[moldPath][action]) {
      return undefined;
    }

    return this._storage.items[moldPath][action].solid;
  }

  getMeta(moldPath, action, metaPath) {
    // TODO: test it
    this._checkParams(moldPath, action);

    if (!this._storage.items[moldPath] || !this._storage.items[moldPath][action]) {
      return undefined;
    }

    return _.get(this._storage.items[moldPath][action].meta, metaPath);
  }

  /**
   * Update partly top level data.
   * @param {string} moldPath
   * @param {string} action
   * @param {object} partialData
   */
  updateTopLevel(moldPath, action, partialData) {
    this._checkParams(moldPath, action);

    this._update(moldPath, action, 'state', partialData);
    this._generateCombined(moldPath, action);

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

  updateTopLevelSilent(moldPath, action, partialData) {
    this._checkParams(moldPath, action);

    this._update(moldPath, action, 'state', partialData);
    this._generateCombined(moldPath, action);

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

  updateMeta(moldPath, action, partialData) {
    this._checkParams(moldPath, action);

    // TODO: test it
    this._update(moldPath, action, 'meta', partialData);
    // TODO: поднимать ли событие any???
  }

  /**
   * Replace data of bottom level and rise silent event.
   * @param {string} moldPath
   * @param {string} action
   * @param {object} newData
   */
  setBottomLevel(moldPath, action, newData) {
    this._checkParams(moldPath, action);

    this.initActionIfNeed(moldPath, action);

    this._storage.items[moldPath][action].solid = newData;
    this._generateCombined(moldPath, action);

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

  _update(moldPath, action, subPath, partialData) {
    if (!moldPath) throw new Error(`ERROR: path is empty`);

    this.initActionIfNeed(moldPath, action);

    const currentData = this._storage.items[moldPath][action][subPath];

    // if there isn't any current data - just set it
    if (_.isUndefined(currentData)) {
      this._storage.items[moldPath][action][subPath] = _.cloneDeep(partialData);

      return;
    }

    // merge

    // TODO: не поднимать события если не было изменений
    // TODO: впринципе не обязательно делать mutate - можно просто заменить, но правильно обработать массивы
    const wereChanges = mutate(currentData, '').update(partialData);

    // TODO: ???? делать мутацию
    //this._storage.topLevel[moldPath] = _.defaultsDeep(_.cloneDeep(partialData), currentData);
  }

  _checkParams(moldPath, action) {
    if (!moldPath) throw new Error(`ERROR: moldPath is empty`);
    if (!action) throw new Error(`ERROR: action is empty`);
  }

  _generateCombined(moldPath, action) {
    const top = this._storage.items[moldPath][action].state;
    const bottom = this._storage.items[moldPath][action].solid;

    // do nothing if there isn't any data
    if (_.isUndefined(top) && _.isUndefined(bottom)) return;

    // TODO: use mutation
    const combined = _.defaultsDeep(_.cloneDeep(top), bottom );
    this._storage.items[moldPath][action].combined = combined;
  }

}
