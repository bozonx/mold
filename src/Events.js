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

  onDeep(path, eventName, handler) {
    // TODO: !!!
  }

  off(event, handler) {
    this.eventEmitter.off(event, handler);
  }

  offAll(path, deep=false) {
    // TODO: продумать
  }

  _getEventName(path, eventName) {
    return `${path}|${eventName}`;
  }

  _parseEventName(fullEventName) {
    // TODO: продумать
  }

}
