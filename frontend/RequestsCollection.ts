import {RequestKey} from './interfaces/RequestKey';
import {ActionProps} from './interfaces/MethodsProps';



// This is for RequestsCollection's items
//export type RequestCollectionItem = Omit<Omit<Omit<ActionProps, 'backend'>, 'set'>, 'action'>;


export default class RequestsCollection {
  constructor() {
  }


  register(requestKey: RequestKey, props: ActionProps): string {
    // init state if it doesn't exist
    this.storage.initStateIfNeed(requestKey);
    //this.requests.register(requestKey, omitObj(actionProps, 'backend', 'set', 'action'));

    //return this.instances.add(requestKey);
  }


  destroy() {
    // TODO: add
  }

}
