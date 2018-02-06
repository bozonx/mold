import _ from 'lodash';
import EventEmitter from 'eventemitter3';


export default class Events {
  constructor() {
    this.eventEmitter = new EventEmitter();
    this._handlers = {};
  }

  emit(path, eventName, eventData) {
    this.eventEmitter.emit(this._getEventName(path, eventName), eventData);
  }

  onChange(path, handler) {
    this.on(path, 'change', handler);
  }

  onAnyChange(path, handler) {
    this.on(path, 'any', handler);
  }

  on(path, eventName, handler) {
    if (!this._handlers[path]) {
      this._handlers[path] = {};
    }
    if (!this._handlers[path][eventName]) {
      this._handlers[path][eventName] = [];
    }

    this._handlers[path][eventName].push(handler);
    this.eventEmitter.on(this._getEventName(path, eventName), handler);
  }

  off(path, eventName, handler) {
    // TODO: test it
    if (this._handlers[path] && this._handlers[path][eventName]) {
      _.find(this._handlers[path][eventName], (foundHandler, index) => {
        if (foundHandler === handler) {
          this._handlers[path][eventName].splice(index, 1);

          return true;
        }
      });
    }

    this.eventEmitter.off(this._getEventName(path, eventName), handler);
  }

  destroy(path) {
    _.each(this._handlers[path], (handlers, eventName) => {
      const fullPath = this._getEventName(path, eventName);

      _.each(this._handlers[path][eventName], (handler, index) => {
        this._handlers[path][eventName].splice(index, 1);
        this.eventEmitter.off(fullPath, handler);
      });
    });
  }

  _getEventName(path, eventName) {
    return `${path}|${eventName}`;
  }

}
