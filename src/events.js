import EventEmitter from 'eventemitter3';
const eventEmitter =  new EventEmitter();


class Events {
  constructor(main) {
  }

  emit(path, eventName, eventData) {
    eventEmitter.emit(this._getEventName(path, eventName), eventData);
  }

  onChange(path,  handler) {
    this.on(path, 'change', handler);
  }

  onAnyChange(path,  handler) {
    this.on(path, 'any', handler);
  }

  on(path, eventName, handler) {
    eventEmitter.on(this._getEventName(path, eventName), handler);
  }

  onDeep(path, eventName, handler) {
    // TODO: !!!
  }

  off(event, handler) {
    eventEmitter.off(event, handler);
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

const events = new Events;
export default events;
