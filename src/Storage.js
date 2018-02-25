import _ from 'lodash';
import { Map, Seq, mergeDeep } from 'immutable';

import Events from './Events';


/**
 * Storage keeps state, server data and meta data of your actions.
 * It has structure like this:
 *     {
 *       items: {
 *         'mold.path.to': {
 *           'default': {            // action
 *             state: {} || [],      // state of your forms and ui elements.
 *             solid: {} || [],      // it is usually data received from server.
 *             combined: {} || [],   // combined state of state and solid
 *             meta: {},             // meta data like page number, etc
 *           }
 *         }
 *       }
 *     }
 *
 * If solid level uses, state level will has to have the same structure as solid level.
 * @class
 */
export default class Storage {
  constructor(log) {
    this._log = log;
    this._events = new Events();
    this._storage = null;
  }

  /**
   * This method runs only once on init time.
   * You can set your own storage as initial storage.
   * @param {object} newStorage - your storage
   */
  $init(newStorage = {}) {
    // TODO: не нужно устанавливать newStorage
    this._storage = newStorage;
    this._storage.items = {};
  }

  $getWholeStorageState() {
    return this._storage;
  }

  /**
   * Initialize state layer of specific mold path.
   * State level uses for real-time ui data.
   * You have to call this method before use action's data.
   * And you have to call this method only once, not for each instance.
   * @param {string} moldPath - path in your schema.
   * @param {string} action - name of action e.g. 'default'.
   * @param {object|array} initialContainer - initial state: an empty [] or {}.
   */
  initAction(moldPath, action, initialContainer) {
    this._checkParams(moldPath, action);


    if (!_.isArray(initialContainer) && !_.isPlainObject(initialContainer)) {
      this._log.fatal(`Invalid type of initial state`);
    }

    if (!this._storage.items[moldPath]) {
      this._storage.items[moldPath] = {};
    }

    this._storage.items[moldPath][action] = {
      state: new Seq(initialContainer),
      solid: new Seq(initialContainer),
      combined: new Seq(initialContainer),
      meta: new Map(),
    };
  }

  getAction(moldPath, action) {
    this._checkParams(moldPath, action);

    const result = {};
    _.each(this._storage.items[moldPath][action], (item, paramName) => result[paramName] = item.toJS());

    return result;
  }

  isActionInited(moldPath, action) {
    return Boolean(this._storage.items[moldPath][action]);
  }

  // /**
  //  * Get all the actions of mold path.
  //  * Don't change this object.
  //  * @param {string} moldPath - path in your schema.
  //  * @return {object|undefined} - all the actions of mold path. Undefined if the action hasn't set.
  //  */
  // getAllActions(moldPath) {
  //   if (!moldPath) this._log.fatal(`MoldPath is empty`);
  //
  //   const result = {};
  //   _.each(this._storage.items[moldPath], (item, actionName) => result[actionName] = item.toJS());
  //
  //   return result;
  // }

  /**
   * Get state layer.
   * @param {string} moldPath - path in your schema.
   * @param {string} action - name of action e.g. 'default'.
   * @return {object|array|undefined} - state layer. It can be an object of an array. Undefined if action hasn't set.
   */
  getState(moldPath, action) {
    this._checkParams(moldPath, action);

    if (!this._storage.items[moldPath] || !this._storage.items[moldPath][action]) return;

    return this._storage.items[moldPath][action].state.toJS();
  }

  /**
   * Get solid layer.
   * @param {string} moldPath - path in your schema.
   * @param {string} action - name of action e.g. 'default'.
   * @return {object|array|undefined} - solid layer. It can be an object of an array. Undefined if action hasn't set.
   */
  getSolid(moldPath, action) {
    this._checkParams(moldPath, action);

    if (!this._storage.items[moldPath] || !this._storage.items[moldPath][action]) return;

    return this._storage.items[moldPath][action].solid.toJS();
  }

  /**
   * Get combined state of state and solid.
   * @param {string} moldPath - path in your schema.
   * @param {string} action - name of action e.g. 'default'.
   * @return {object|array|undefined} - combined state of state and solid layers. Undefined if action hasn't set.
   */
  getCombined(moldPath, action) {
    this._checkParams(moldPath, action);

    if (!this._storage.items[moldPath] || !this._storage.items[moldPath][action]) return;

    return this._storage.items[moldPath][action].combined.toJS();
  }

  /**
   * Get meta params of action.
   * @param {string} moldPath - path in your schema.
   * @param {string} action - name of action e.g. 'default'.
   * @param {string|undefined} metaPath - sub path to meta param. Optional.
   * @return {object|undefined} - meta-data object. Undefined if action hasn't set.
   */
  getMeta(moldPath, action, metaPath = undefined) {
    this._checkParams(moldPath, action);

    // TODO: use immutable

    if (!this._storage.items[moldPath] || !this._storage.items[moldPath][action]) return;

    if (metaPath) {
      return _.get(this._storage.items[moldPath][action].meta, metaPath);
    }
    else {
      // whole meta data
      return this._storage.items[moldPath][action].meta;
    }
  }

  /**
   * Replace state data with new data.
   * @param {string} moldPath - path in your schema.
   * @param {string} action - name of action e.g. 'default'.
   * @param {object|array} newData - the new data.
   */
  setStateLayerSilent(moldPath, action, newData) {
    this._checkParams(moldPath, action);

    // do nothing if data the same
    if (_.isEqual(newData, this._storage.items[moldPath][action].state.toJS())) {
      return;
    }

    // set data
    this._storage.items[moldPath][action].state = new Seq(newData);

    this._generateCombined(moldPath, action);

    this._emitActionEvent(moldPath, action, 'any', {
      data: this._storage.items[moldPath][action].state.toJS(),
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
  updateStateLayer(moldPath, action, partialData) {
    // TODO: remake tests
    this._updateStateLayer(moldPath, action, partialData);

    // TODO: если не было изменений наверное не поднимать события

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

  updateStateLayerSilent(moldPath, action, partialData) {
    // TODO: remake tests
    this._updateStateLayer(moldPath, action, partialData);

    // TODO: если не было изменений наверное не поднимать события
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

  /**
   * Replace data of solid level and rise an silent event.
   * This method has to call only after request to server to set received data.
   * @param {string} moldPath - path in your schema.
   * @param {string} action - name of action e.g. 'default'.
   * @param {object|array} newData - the new data.
   */
  setSolidLayer(moldPath, action, newData) {
    this._checkParams(moldPath, action);

    // do nothing if data the same
    if (_.isEqual(newData, this._storage.items[moldPath][action].solid.toJS())) {
      return;
    }

    // set data
    this._storage.items[moldPath][action].solid = new Seq(newData);
    this._clearStateBeforeSetSolid(this._storage.items[moldPath][action]);
    this._generateCombined(moldPath, action);

    this._emitActionEvent(moldPath, action, 'solid', {
      data: this._storage.items[moldPath][action].solid.toJS(),
      by: 'program',
      type: 'silent',
    });
    this._emitActionEvent(moldPath, action, 'any', {
      data: this._storage.items[moldPath][action].solid.toJS(),
      by: 'program',
      type: 'silent',
    });
  }

  updateMeta(moldPath, action, partialData) {
    this._checkParams(moldPath, action);
    //this._initActionIfNeed(moldPath, action);

    // TODO: use immutable
    // TODO: может использовать this._update ?
    const currentData = this._storage.items[moldPath][action].meta;
    this._storage.items[moldPath][action].meta = _.defaultsDeep(_.cloneDeep(partialData), currentData);

    this._emitActionEvent(moldPath, action, 'any', {
      data: partialData,
      by: 'program',
      type: 'meta',
    });
  }

  // /**
  //  * Clear state level silently.
  //  * @param {string} moldPath - path in your schema.
  //  * @param {string} action - name of action e.g. 'default'.
  //  */
  // clearStateLayer(moldPath, action) {
  //   // TODO: нужно все очистить или только то что должно быть замененно с сервера?
  //
  //   // TODO: test
  //   if (!this._storage.items[moldPath]
  //     || !this._storage.items[moldPath][action]
  //     || !this._storage.items[moldPath][action].state) {
  //     return;
  //   }
  //
  //   // TODO: поидее с мутацией надо ???
  //   let newData = [];
  //   if (_.isPlainObject(this._storage.items[moldPath][action].state)) {
  //     newData = {};
  //   }
  //
  //   // TODO: use immutable
  //
  //   this._storage.items[moldPath][action].state = newData;
  //
  //   this._emitActionEvent(moldPath, action, 'any', {
  //     data: newData,
  //     by: 'program',
  //     type: 'silent',
  //   });
  // }


  /**
   * Listen for any event.
   * @param {string} eventName - event name
   * @param {function} handler - event handler
   */
  on(eventName, handler) {
    this._events.on(eventName, handler);
  }

  /**
   * Listen for user's changes of whole storage.
   * @param {function} handler - event handler
   */
  onChange(handler) {
    this._events.on('change', handler);
  }

  /**
   * Listen for any changes of whole storage.
   * @param {function} handler - event handler
   */
  onAnyChange(handler) {
    this._events.on('any', handler);
  }

  /**
   * Remove listener of whole storage.
   * @param {function} handler - event handler
   */
  off(handler) {
    this._events.off('change', handler);
    this._events.off('any', handler);
  }

  onChangeAction(moldPath, action, handler) {
    const fullEventName = this._getEventName( this._getFullPath(moldPath, action), 'change' );
    this._events.on(fullEventName, handler);
  }

  onAnyChangeAction(moldPath, action, handler) {
    const fullEventName = this._getEventName( this._getFullPath(moldPath, action), 'any' );
    this._events.on(fullEventName, handler);
  }

  offAction(moldPath, action, eventName, handler) {
    const fullEventName = this._getEventName( this._getFullPath(moldPath, action), eventName );
    this._events.off(fullEventName, handler);
  }

  /**
   * Destroy an action. It removes whole data of action and destroy events of this data.
   * @param {string} moldPath - path in your schema.
   * @param {string} action - name of action e.g. 'default'.
   */
  destroy(moldPath, action) {
    // TODO: review
    if (this._storage.items[moldPath] && this._storage.items[moldPath][action]) {
      delete this._storage.items[moldPath][action];
    }

    this._events.destroy(this._getFullPath(moldPath, action));
  }

  // _newImmutable(fullData) {
  //   // TODO: может использовать Seq?
  //   let immutableData;
  //   if (_.isPlainObject(fullData)) {
  //     immutableData = new Map(fullData);
  //   }
  //   else if (_.isArray(fullData)) {
  //     immutableData = new List(fullData);
  //   }
  //   else {
  //     this._log.fatal(`Bad type of data`);
  //   }
  //
  //   return immutableData;
  // }

  // _initAction(moldPath, action) {
  //   if (!this._storage.items[moldPath]) {
  //     this._storage.items[moldPath] = {};
  //   }
  //
  //   if (!this._storage.items[moldPath][action]) {
  //     this._storage.items[moldPath][action] = {};
  //   }
  // }

  _updateStateLayer(moldPath, action, partialData) {
    // TODO: review

    this._checkParams(moldPath, action);

    // TODO: наверное просто use immutable and deep merge
    // TODO: были ли изменения - можно понять сравнив со старыми данными
    const wereChanges = this._update(moldPath, action, 'state', partialData);

    // do nothing if there weren't any changes
    if (!wereChanges) return;

    this._generateCombined(moldPath, action);
  }

  _emitActionEvent(moldPath, action, eventName, eventData) {
    const data = {
      ...eventData,
      moldPath,
      action,
    };

    // emit event only for certain event
    this._events.emit(this._getEventName( this._getFullPath(moldPath, action), eventName ), data);
    // TODO: не используется
    // emit event for mold path
    this._events.emit(this._getEventName( moldPath, eventName ), data);
    // emit common event like change or any
    this._events.emit(eventName, data);
  }

  _getFullPath(moldPath, action) {
    return `${moldPath}-${action}`;
  }

  _checkParams(moldPath, action) {
    if (!moldPath) this._log.fatal(`MoldPath is empty`);
    if (!action) this._log.fatal(`Action is empty`);
  }

  _update(moldPath, action, subPath, partialData) {
    //this._initActionIfNeed(moldPath, action);

    const currentData = this._storage.items[moldPath][action][subPath];
    const oldDataCopy = _.clone(this._storage.items[moldPath][action][subPath]);

    // // if there isn't any current data - just set it
    // if (_.isUndefined(currentData)) {
    //   this._storage.items[moldPath][action][subPath] = _.cloneDeep(partialData);
    //
    //   return;
    // }

    // TODO: use immutable
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
    const merged = _.defaultsDeep(top.toJS(), bottom.toJS());

    this._storage.items[moldPath][action].combined = new Seq(merged);
  }

  _clearStateBeforeSetSolid(action) {
    // TODO: test it

    const solid = action.solid.toJS();

    const clearObject = (localSolid, localState) => {
      const solidKeys = _.keys( localSolid );
      _.each(solidKeys, (name) => delete localState[name]);
    };

    if (_.isArray(solid)) {
      _.each(solid, (item, index) => {
        if (!_.isPlainObject(action.state.item)) return;
        action.state[index] = new Seq( clearObject(item, action.state[index].toJS()) );
      });
    }
    else if (_.isPlainObject(solid)){
      action.state = new Seq( clearObject(solid, action.state.toJS()) );
    }
    else {
      this._log.fatal(`Invalid type of solid layer`);
    }
  }

  _getEventName(path, eventName) {
    if (!path) return eventName;

    return `${path}|${eventName}`;
  }

}
