import _ from 'lodash';
import EventEmitter from 'eventemitter3';


export default class Events {
  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  getListeners(name) {
    return this.eventEmitter.listeners(name);
  }

  emit(eventName, eventData) {
    this.eventEmitter.emit(eventName, eventData);
  }

  on(eventName, handler) {
    this.eventEmitter.on(eventName, handler);
  }

  off(eventName, handler) {
    this.eventEmitter.off(eventName, handler);
  }

  /**
   * Destroy all the events on mold path and its events.
   * @param {string} path - mold path
   */
  destroy(path) {
    const eventNames = this.eventEmitter.eventNames();

    _.each(eventNames, (name) => {
      if (name.indexOf(path) !== 0) return;

      // get handlers by name
      _.each(this.getListeners(name), (handler) => {
        this.eventEmitter.off(name, handler);
      });
    });

  }

}
