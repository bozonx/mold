import _ from 'lodash';

import { mutate } from './helpers/mutate';


/**
 * Storage keep state, server data and meta data of your actions.
 * It has structure like this:
 *     {
 *       items: {
 *         'mold.path.to': {
 *           state: {} || [],      // state of your forms and ui elements.
 *           solid: {} || [],     // it is usually data received from server.
 *           combined: {} || [],   // combined state of state and solid
 *           meta: {},             // meta data like page number, etc
 *         }
 *       }
 *     }
 *
 * If solid level uses state level will has to have the same structure as solid level.
 * @class
 */
export default class Storage {
  constructor(events) {
    this._events = events;
    this._storage = null;
  }

  /**
   * Set new storage.
   * This method runs one time from State.js.
   * Don't run it from your application.
   * @param {object} newStorage - your storage
   */
  $init(newStorage) {
    this._storage = newStorage;
    this._storage.items = {};
  }

  $getWholeStorageState() {
    return this._storage;
  }

  /**
   * Initialize state level on specific mold path.
   * State level uses for real-time ui data.
   * @param {string} moldPath - path in your schema.
   * @param {string} action - name of action e.g. 'default'.
   * @param {object|array} initialState - initial state object or array which will store state.
   */
  initState(moldPath, action, initialState) {
    this._checkParams(moldPath, action);
    this._initActionIfNeed(moldPath, action);

    this._storage.items[moldPath][action].state = initialState;
    this._generateCombined(moldPath, action);
  }

  /**
   * Get all the actions ofy mold path.
   * @param {string} moldPath - path in your schema.
   * @return {object|undefined} - all the actions of mold path. Undefined if action hasn't set.
   */
  getNode(moldPath) {
    if (!moldPath) throw new Error(`MoldPath is empty`);

    return this._storage.items[moldPath];
  }

  /**
   * Get combined state of state and solid.
   * @param {string} moldPath - path in your schema.
   * @param {string} action - name of action e.g. 'default'.
   * @return {object|array|undefined} - combined state of state and solid.
   */
  getCombined(moldPath, action) {
    this._checkParams(moldPath, action);

    if (!this._storage.items[moldPath] || !this._storage.items[moldPath][action]) {
      return;
    }

    return this._storage.items[moldPath][action].combined;
  }

  /**
   * Get state level.
   * @param {string} moldPath - path in your schema.
   * @param {string} action - name of action e.g. 'default'.
   * @return {object|array|undefined} - state object or array. Undefined if action hasn't set.
   */
  getState(moldPath, action) {
    this._checkParams(moldPath, action);

    if (!this._storage.items[moldPath] || !this._storage.items[moldPath][action]) {
      return;
    }

    return this._storage.items[moldPath][action].state;
  }

  getSolid(moldPath, action) {
    this._checkParams(moldPath, action);

    if (!this._storage.items[moldPath] || !this._storage.items[moldPath][action]) {
      return;
    }

    return this._storage.items[moldPath][action].solid;
  }

  /**
   * Get meta params of action.
   * @param {string} moldPath - path in your schema.
   * @param {string} action - name of action e.g. 'default'.
   * @param {string|undefined} metaPath - sub path to meta param. Optional.
   * @return {object|undefined} - meta data object. Undefined if action hasn't set.
   */
  getMeta(moldPath, action, metaPath = undefined) {
    this._checkParams(moldPath, action);

    if (!this._storage.items[moldPath] || !this._storage.items[moldPath][action]) {
      return;
    }

    if (metaPath) {
      return _.get(this._storage.items[moldPath][action].meta, metaPath);
    }
    else {
      return this._storage.items[moldPath][action].meta;
    }
  }

  /**
   * Replace state data with new data.
   * @param {string} moldPath - path in your schema.
   * @param {string} action - name of action e.g. 'default'.
   * @param {object|array} fullData - the new data.
   */
  setTopLevelSilent(moldPath, action, fullData) {
    // TODO: test
    this._checkParams(moldPath, action);

    // do nothing if data the same
    if (_.isEqual(this._storage.items[moldPath][action].state, fullData)) {
      return;
    }

    this._initActionIfNeed(moldPath, action);
    // set data
    // TODO: поидее с мутацией надо
    this._storage.items[moldPath][action].state = fullData;
    this._generateCombined(moldPath, action);

    this._emitActionEvent(moldPath, action, 'any', {
      data: fullData,
      by: 'program',
      type: 'silent',
    });
  }

  /**
   * Partly update top level data.
   * @param {string} moldPath - path in your schema.
   * @param {string} action - name of action e.g. 'default'.
   * @param {object|array} partialData - the new partial data.
   */
  updateTopLevel(moldPath, action, partialData) {
    this._updateTopLevel(moldPath, action, partialData);

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
    this._updateTopLevel(moldPath, action, partialData);

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
    this._initActionIfNeed(moldPath, action);

    // TODO: может использовать this._update ?
    const currentData = this._storage.items[moldPath][action].meta;
    this._storage.items[moldPath][action].meta = _.defaultsDeep(_.cloneDeep(partialData), currentData);

    this._emitActionEvent(moldPath, action, 'any', {
      data: partialData,
      by: 'program',
      type: 'meta',
    });
  }

  /**
   * Clear state level silently.
   * @param {string} moldPath - path in your schema.
   * @param {string} action - name of action e.g. 'default'.
   */
  clearTopLevel(moldPath, action) {
    // TODO: test
    if (!this._storage.items[moldPath]
      || !this._storage.items[moldPath][action]
      || !this._storage.items[moldPath][action].state) {
      return;
    }

    // TODO: поидее с мутацией надо ???
    let newData = [];
    if (_.isPlainObject(this._storage.items[moldPath][action].state)) {
      newData = {};
    }

    this._storage.items[moldPath][action].state = newData;

    this._emitActionEvent(moldPath, action, 'any', {
      data: newData,
      by: 'program',
      type: 'silent',
    });
  }

  /**
   * Replace data of solid level and rise an silent event.
   * This method has to call only after request to server to set received data.
   * @param {string} moldPath - path in your schema.
   * @param {string} action - name of action e.g. 'default'.
   * @param {object|array} newData - the new data.
   */
  setBottomLevel(moldPath, action, newData) {
    this._checkParams(moldPath, action);

    this._initActionIfNeed(moldPath, action);

    this._storage.items[moldPath][action].solid = newData;
    this._generateCombined(moldPath, action);

    // TODO: наверное не bottom а solid???
    this._emitActionEvent(moldPath, action, 'bottom', {
      data: newData,
      by: 'program',
      type: 'silent',
    });
    this._emitActionEvent(moldPath, action, 'any', {
      data: newData,
      by: 'program',
      type: 'silent',
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

  /**
   * Destroy an action. It removes whole data of action and destroy events of this data.
   * @param {string} moldPath - path in your schema.
   * @param {string} action - name of action e.g. 'default'.
   */
  destroy(moldPath, action) {
    if (this._storage.items[moldPath] && this._storage.items[moldPath][action]) {
      delete this._storage.items[moldPath][action];
    }

    this._events.destroy(this._getFullPath(moldPath, action));
  }

  _initActionIfNeed(moldPath, action) {
    if (!this._storage.items[moldPath]) {
      this._storage.items[moldPath] = {};
    }

    if (!this._storage.items[moldPath][action]) {
      this._storage.items[moldPath][action] = {};
    }
  }

  _updateTopLevel(moldPath, action, partialData) {
    this._checkParams(moldPath, action);

    const wereChanges = this._update(moldPath, action, 'state', partialData);

    // do nothing if there weren't any changes
    if (!wereChanges) return;

    this._generateCombined(moldPath, action);
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

  _checkParams(moldPath, action) {
    if (!moldPath) throw new Error(`MoldPath is empty`);
    if (!action) throw new Error(`Action is empty`);
  }

  _update(moldPath, action, subPath, partialData) {
    this._initActionIfNeed(moldPath, action);

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
