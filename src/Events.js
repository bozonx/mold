import _ from 'lodash';
import EventEmitter from 'eventemitter3';


export default class Events {
  constructor() {
    this.eventEmitter = new EventEmitter();
    //this._handlers = {};
  }

  emit(path, eventName, eventData) {
    const fullPath = this._getEventName(path, eventName);

    this.eventEmitter.emit(fullPath, eventData);
  }

  on(path, eventName, handler) {
    const fullPath = this._getEventName(path, eventName);

    // if (!this._handlers[fullPath]) {
    //   this._handlers[fullPath] = [];
    // }
    //
    // this._handlers[pathParam][eventName].push(handler);

    this.eventEmitter.on(fullPath, handler);
  }

  off(path, eventName, handler) {
    // TODO: test it
    const fullPath = this._getEventName(path, eventName);

    // if (this._handlers[pathParam] && this._handlers[pathParam][eventName]) {
    //   // remove listener from list
    //   _.find(this._handlers[pathParam][eventName], (foundHandler, index) => {
    //     if (foundHandler === handler) {
    //       this._handlers[pathParam][eventName].splice(index, 1);
    //
    //       return true;
    //     }
    //   });
    // }

    this.eventEmitter.off(fullPath, handler);
  }

  destroy(path) {
    // TODO: get listeners from events
    // _.each(this._handlers[path], (handlers, eventName) => {
    //   const fullPath = this._getEventName(path, eventName);
    //
    //   _.each(this._handlers[path][eventName], (handler, index) => {
    //     this._handlers[path][eventName].splice(index, 1);
    //     this.eventEmitter.off(fullPath, handler);
    //   });
    // });
  }

  _getEventName(path, eventName) {
    if (!path) return eventName;

    return `${path}|${eventName}`;
  }

}
