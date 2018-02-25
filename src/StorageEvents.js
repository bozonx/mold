import _ from 'lodash';
import EventEmitter from 'eventemitter3';


export default class Events {
  constructor() {
    this.eventEmitter = new EventEmitter();
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

  destroy(path) {
    const eventNames = this.eventEmitter.eventNames();

    _.find(eventNames, (name) => {
      // TODO: может нужно полностью сравнивать?
      //if (name === path) {
      if (name.indexOf(path) === 0) {
        _.each(this.eventEmitter.listeners(name), (handler) => {
          this.eventEmitter.off(name, handler);
        });

        return true;
      }
    });

  }

}
