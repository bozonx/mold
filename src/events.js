import EventEmitter from 'eventemitter3';
const eventEmitter =  new EventEmitter();

// TODO: продумать - path

class Events {
  constructor(main) {
  }

  // path, eventName, byWhom, eventData
  emit(eventName, eventData) {
    eventEmitter.emit(eventName, eventData);
  }

  onChange(event, handler) {
    this.on(event, handler);
  }

  onAnyChange(event, handler) {
    this.on(event, handler);
  }

  on(eventName, handler) {
    eventEmitter.on(eventName, handler);
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

}

const events = new Events;
export default events;
