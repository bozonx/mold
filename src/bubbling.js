import _ from 'lodash';

/**
 * Bubbling - rise event on end point and their parents.
 * @param {EventEmitter2} events - link to EventEmitter2
 * @param {string} rootMold - root in mold format
 * @param {string} rootEvent - root for events name
 */
class Bubbling {
  constructor(events, rootMold, rootEvent) {
    this.events = events;
    this.rootMold = rootMold;
    this.rootEvent = rootEvent;
  }

  /**
   * Start event emitting
   * @param {array} changes - it's changes data in "mutate" class format [moldPath, value, action]
   */
  start(changes) {
    _.each(changes, (value) => {
      this._handleEndPoint(...value);
    });
  }

  _handleEndPoint(moldPath, value, action) {
    // Don't rise an event if value haven't been changed
    if (action == 'unchanged') return;

    this.events.emit(this._combineEventPath(moldPath), {
      path: moldPath,
      isTarget: true,
      target: {
        path: moldPath,
        action,
        value,
      },
    });
  }
  
  _emitBubbles() {
    
  }

  _combineEventPath(moldPath) {
    return `${this.rootEvent}::${moldPath}`;
  }
}

export default function(events, rootMold, rootEvent, changes) {
  var bubbling = new Bubbling(events, rootMold, rootEvent);
  bubbling.start(changes);
}
