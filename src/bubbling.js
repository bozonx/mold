import _ from 'lodash';

class Bubbling {
  constructor(rootMold, rootEvent) {
    this.rootMold = rootMold;
    this.rootEvent = rootEvent;
  }

  start(changes) {

  }

}

export default function(rootMold, rootEvent, changes) {
  var bubbling = new Bubbling(rootMold, rootEvent);
  bubbling.start(changes);
}
