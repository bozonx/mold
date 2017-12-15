import _ from 'lodash';

import { concatPath } from './helpers/helpers';
import { mutate } from './helpers/mutate';


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
    this._storage.items = {};
  }

  $getWholeStorageState() {
    return this._storage;
  }

  initState(moldPath, action, initialState) {
    this._checkParams(moldPath, action);
    this.initActionIfNeed(moldPath, action);

    this._storage.items[moldPath][action].state = initialState;
    this._generateCombined(moldPath, action);
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
    if (!moldPath) throw new Error(`MoldPath is empty`);

    return this._storage.items[moldPath];
  }

  getCombined(moldPath, action) {
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
    this._checkParams(moldPath, action);

    if (!this._storage.items[moldPath] || !this._storage.items[moldPath][action]) {
      return undefined;
    }

    return this._storage.items[moldPath][action].state;
  }

  getSolid(moldPath, action) {
    this._checkParams(moldPath, action);

    if (!this._storage.items[moldPath] || !this._storage.items[moldPath][action]) {
      return undefined;
    }

    return this._storage.items[moldPath][action].solid;
  }

  getMeta(moldPath, action, metaPath=undefined) {
    this._checkParams(moldPath, action);

    if (!this._storage.items[moldPath] || !this._storage.items[moldPath][action]) {
      return undefined;
    }

    if (metaPath) {
      return _.get(this._storage.items[moldPath][action].meta, metaPath);
    }
    else {
      return this._storage.items[moldPath][action].meta;
    }
  }

  setTopLevel(moldPath, action, fullData) {
    // TODO: silent
    // TODO: test
    this._checkParams(moldPath, action);

    // do nothing if data the same
    if (_.isEqual(this._storage.items[moldPath][action].state, fullData)) {
      return;
    }

    this.initActionIfNeed(moldPath, action);
    // set data
    // TODO: поидее с мутацией надо
    this._storage.items[moldPath][action].state = fullData;
    this._generateCombined(moldPath, action);

    this._emitActionEvent(moldPath, action, 'change', {
      data: fullData,
      by: 'user',
    });
    this._emitActionEvent(moldPath, action, 'any', {
      data: fullData,
      by: 'user',
      type: 'state',
    });
  }

  /**
   * Update partly top level data.
   * @param {string} moldPath
   * @param {string} action
   * @param {object} partialData
   */
  updateTopLevel(moldPath, action, partialData) {
    this._checkParams(moldPath, action);

    const wereChanges = this._update(moldPath, action, 'state', partialData);

    // do nothing if there weren't any changes
    if (!wereChanges) return;

    this._generateCombined(moldPath, action);

    this._emitActionEvent(moldPath, action, 'change', {
      data: partialData,
      by: 'user',
    });
    this._emitActionEvent(moldPath, action, 'any', {
      data: partialData,
      by: 'user',
      type: 'state',
    });
  }

  updateTopLevelSilent(moldPath, action, partialData) {
    this._checkParams(moldPath, action);

    const wereChanges = this._update(moldPath, action, 'state', partialData);

    // do nothing if there weren't any changes
    if (!wereChanges) return;

    this._generateCombined(moldPath, action);

    this._emitActionEvent(moldPath, action, 'silent', {
      data: partialData,
      by: 'program',
    });
    this._emitActionEvent(moldPath, action, 'any', {
      data: partialData,
      by: 'program',
      type: 'silent',
    });
  }

  updateMeta(moldPath, action, partialData) {
    this._checkParams(moldPath, action);
    this.initActionIfNeed(moldPath, action);

    // TODO: может опять использовать this._update ?
    const currentData = this._storage.items[moldPath][action].meta;
    this._storage.items[moldPath][action].meta = _.defaultsDeep(_.cloneDeep(partialData), currentData);

    this._emitActionEvent(moldPath, action, 'any', {
      data: partialData,
      by: 'program',
      type: 'meta',
    });
  }

  clearTopLevel(moldPath, action) {
    if (!this._storage.items[moldPath]
      || !this._storage.items[moldPath][action]
      || !this._storage.items[moldPath][action].state) {
      return;
    }

    // TODO: поидее с мутацией надо ???
    if (_.isPlainObject(this._storage.items[moldPath][action].state)) {
      this._storage.items[moldPath][action].state = {};
    }
    else {
      this._storage.items[moldPath][action].state = [];
    }
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

    this._emitActionEvent(moldPath, action, 'bottom', {
      data: newData,
      by: 'program',
    });
    this._emitActionEvent(moldPath, action, 'any', {
      data: newData,
      by: 'program',
    });
  }

  onChange(moldPath, action, handler) {
    this._events.onChange(this._getFullPath(moldPath, action), handler);
  }

  onAnyChange(moldPath, action, handler) {
    this._events.onAnyChange(this._getFullPath(moldPath, action), handler);
  }

  off(moldPath, action, event, handler) {
    this._events.off(this._getFullPath(moldPath, action), event, handler);
  }

  destroy(moldPath, action) {
    if (this._storage.items[moldPath] && this._storage.items[moldPath][action]) {
      delete this._storage.items[moldPath][action];
    }

    this._events.destroy(this._getFullPath(moldPath, action));
  }

  _emitActionEvent(moldPath, action, eventName, eventData) {
    const data = {
      ...eventData,
      action,
    };
    // emit event only for certain event
    this._events.emit(this._getFullPath(moldPath, action), eventName, data);
    // emit event for mold path
    this._events.emit(moldPath, eventName, data);
  }

  _getFullPath(moldPath, action) {
    return `${moldPath}-${action}`;
  }

  _update(moldPath, action, subPath, partialData) {
    this.initActionIfNeed(moldPath, action);

    const currentData = this._storage.items[moldPath][action][subPath];
    const oldDataCopy = _.clone(this._storage.items[moldPath][action][subPath]);

    // // if there isn't any current data - just set it
    // if (_.isUndefined(currentData)) {
    //   this._storage.items[moldPath][action][subPath] = _.cloneDeep(partialData);
    //
    //   return;
    // }

    // TODO: test arrays
    // TODO: если есть массивы, то они полностью берутся из новых данных
    // TODO: наверное можно использоват mutate, но контейнеры обновлять с алгоритмом defaults
    this._storage.items[moldPath][action][subPath] = _.defaultsDeep(_.cloneDeep(partialData), currentData);

    // if were changes - return true, else false
    return !_.isEqual(oldDataCopy, this._storage.items[moldPath][action][subPath]);
  }

  _checkParams(moldPath, action) {
    if (!moldPath) throw new Error(`MoldPath is empty`);
    if (!action) throw new Error(`Action is empty`);
  }

  _generateCombined(moldPath, action) {
    const top = this._storage.items[moldPath][action].state;
    const bottom = this._storage.items[moldPath][action].solid;

    // TODO: test arrays
    // TODO: наверное можно использоват mutate, но контейнеры обновлять с алгоритмом defaults
    const newData = _.defaultsDeep(_.cloneDeep(top), bottom);

    if (_.isUndefined(this._storage.items[moldPath][action].combined)) {
      this._storage.items[moldPath][action].combined = newData;
    }
    else {
      if (_.isUndefined(newData)) return;
      mutate(this._storage.items[moldPath][action].combined).combine(newData);
    }
  }
}
