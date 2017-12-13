import EventEmitter from 'eventemitter3';


export default class Events {
  constructor() {
    this.eventEmitter =  new EventEmitter();
  }

  emit(path, eventName, eventData) {
    this.eventEmitter.emit(this._getEventName(path, eventName), eventData);
  }

  onChange(path,  handler) {
    this.on(path, 'change', handler);
  }

  onAnyChange(path,  handler) {
    this.on(path, 'any', handler);
  }

  on(path, eventName, handler) {
    this.eventEmitter.on(this._getEventName(path, eventName), handler);
  }

  off(path, eventName, handler) {
    this.eventEmitter.off(this._getEventName(path, eventName), handler);
  }

  _getEventName(path, eventName) {
    return `${path}|${eventName}`;
  }

}
