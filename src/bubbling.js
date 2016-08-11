import _ from 'lodash';

import { splitLastParamPath, getUniqPartOfPaths } from './helpers';

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
    var uniqPath = getUniqPartOfPaths(_.map(changes, value => value[0]));
    var target;

    if (changes.length === 1) {
      target = {
        path: changes[0][0],
        action: changes[0][2],
        //value: changes[0][1],
      };
    }
    else if (changes.length > 1) {
      target = {
        path: uniqPath,
        action: 'change',
        //value
      };
      // rise events on all endpoints
      _.each(changes, (value) => {
        this._handleEndPoint(...value);
      });
    }
    else {
      return;
    }

    // rise event on container endpoint or single endpoint
    this._handleEndPoint(target.path, null, target.action);

    // TODO: не поднимать баблы если есть хоть один action: unchanged

    var rawBubblePath = splitLastParamPath(uniqPath);
    if (!rawBubblePath.basePath) return;

    // run bubbles
    this._emitBubbles(rawBubblePath.basePath, target);

    console.log(changes)
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
        //value,
      },
    });
  }

  _emitBubbles(path, target) {
    var splits = path.split('.');

    _.each(path.split('.'), (value, index) => {
      var currentPath = splits.slice(0, index + 1).join('.');

      this.events.emit(this._combineEventPath(currentPath), {
        path: currentPath,
        isTarget: false,
        target: target,
      });
    });
  }

  _combineEventPath(moldPath) {
    return `${this.rootEvent}::${moldPath}`;
  }
}

export default function(events, rootMold, rootEvent, changes) {
  var bubbling = new Bubbling(events, rootMold, rootEvent);
  bubbling.start(changes);
}
