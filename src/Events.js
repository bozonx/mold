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

  on(path, eventName, handler) {
    const pathParam = path || '$root';

    if (!this._handlers[pathParam]) {
      this._handlers[pathParam] = {};
    }
    if (!this._handlers[pathParam][eventName]) {
      this._handlers[pathParam][eventName] = [];
    }

    this._handlers[pathParam][eventName].push(handler);

    if (path) {
      this.eventEmitter.on(this._getEventName(path, eventName), handler);
    }
    else {
      this.eventEmitter.on(eventName, handler);
    }
  }

  off(path, eventName, handler) {
    // TODO: test it
    const pathParam = path || '$root';

    if (this._handlers[pathParam] && this._handlers[pathParam][eventName]) {
      // remove listener from list
      _.find(this._handlers[pathParam][eventName], (foundHandler, index) => {
        if (foundHandler === handler) {
          this._handlers[pathParam][eventName].splice(index, 1);

          return true;
        }
      });
    }

    if (path) {
      this.eventEmitter.off(this._getEventName(path, eventName), handler);
    }
    else {
      this.eventEmitter.off(eventName, handler);
    }
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
