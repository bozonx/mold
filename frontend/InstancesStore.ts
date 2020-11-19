import {ActionProps} from './interfaces/MethodsProps';
import {REQUEST_KEY_SEPARATOR, RequestKey} from './interfaces/RequestKey';
import {requestKeyToString} from '../helpers/common';
import {isEmptyObject} from '../helpers/objects';


export class InstancesStore {
  // props of requests like { backend: { set: { action: { request: {...props} } } } }
  private requests: {[index: string]: {[index: string]: {[index: string]: {[index: string]: ActionProps}}}} = {};
  // object like: { "backend|set|action|request": ["0", "1", ...] }
  private instances: {[index: string]: string[]} = {};


  constructor() {
  }

  destroy() {
    this.instances = {};
    this.requests = {};
  }


  getProps(requestKey: RequestKey): ActionProps | undefined {
    const [backend, set, action, request] = requestKey;

    return this.requests[backend]
      && this.requests[backend][set]
      && this.requests[backend][set][action]
      && this.requests[backend][set][action][request];
  }

  addInstance(requestKey: RequestKey): string {
    const requestKeyStr: string = requestKeyToString(requestKey);
    const requestInstances: string[] | undefined = this.instances[requestKeyStr];
    let newInstanceNum = '0';

    if (requestInstances) {
      // TODO: test by hard
      const newInstanceNum: string = String(this.instances[requestKeyStr].length);

      this.instances[requestKeyStr].push(newInstanceNum);
    }
    else {
      this.instances[requestKeyStr] = [newInstanceNum];
    }

    return requestKeyStr + REQUEST_KEY_SEPARATOR + newInstanceNum;
  }

  removeProps(requestKey: RequestKey) {
    const [backend, set, action, request] = requestKey;

    if (
      this.requests[backend]
      && this.requests[backend][set]
      && this.requests[backend][set][action]
      && this.requests[backend][set][action][request]
    ) {
      delete this.requests[backend][set][action][request];
    }

    if (isEmptyObject(this.requests[backend][set][action])) {
      delete this.requests[backend][set][action];
    }

    if (isEmptyObject(this.requests[backend][set])) {
      delete this.requests[backend][set];
    }

    if (isEmptyObject(this.requests[backend])) {
      delete this.requests[backend];
    }
  }

  /**
   * Put or replace the latest request props.
   */
  storeProps(requestKey: RequestKey, props: ActionProps) {
    const [backend, set, action, request] = requestKey;

    if (!this.requests[backend]) {
      this.requests[backend] = {};
    }

    if (!this.requests[backend][set]) {
      this.requests[backend][set] = {};
    }

    if (!this.requests[backend][set][action]) {
      this.requests[backend][set][action] = {};
    }

    this.requests[backend][set][action][request] = props;
  }

}
