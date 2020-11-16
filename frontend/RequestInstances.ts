import {RequestKey} from './interfaces/RequestKey';
import {requestKeyToString} from '../helpers/common';


export default class RequestInstances {
  add(requestKey: RequestKey): string {
    // TODO: add
    return requestKeyToString(requestKey) + '|0';
  }

}
