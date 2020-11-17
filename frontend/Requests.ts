import {REQUEST_KEY_POSITIONS, REQUEST_KEY_SEPARATOR, RequestKey} from './interfaces/RequestKey';
import {ActionProps} from './interfaces/MethodsProps';
import Mold from './Mold';
import BackendResponse from '../interfaces/BackendResponse';
import {isEmptyObject} from '../helpers/objects';
import {requestKeyToString, splitInstanceId} from '../helpers/common';
import {REQUEST_STATUSES} from './constants';


export default class Requests {
  private mold: Mold;
  // props of requests like { backend: { set: { action: { request: {...props} } } } }
  private requests: {[index: string]: {[index: string]: {[index: string]: {[index: string]: ActionProps}}}} = {};
  // object like: { "backend|set|action|request": ["0", "1", ...] }
  private instances: {[index: string]: string[]} = {};


  constructor(mold: Mold) {
    this.mold = mold;
  }

  destroy() {
    this.instances = {};
    this.requests = {};
  }


  doesInstanceNumExist(requestKey: RequestKey, instanceNum: string): boolean {
    const requestKeyStr: string = requestKeyToString(requestKey);
    const requestInstances: string[] | undefined = this.instances[requestKeyStr];

    // TODO: check storage exists
    // TODO: check props exists

    if (!requestInstances) return false;
    // TODO: test
    return requestInstances.indexOf(instanceNum) >= 0;
  }

  getProps(requestKey: RequestKey): ActionProps | undefined {
    const [backend, set, action, request] = requestKey;

    return this.requests[backend]
      && this.requests[backend][set]
      && this.requests[backend][set][action]
      && this.requests[backend][set][action][request];
  }

  register(requestKey: RequestKey, props: ActionProps): string {
    // init state if it doesn't exist
    this.mold.storage.initStateIfNeed(requestKey);
    // put or update request props into store
    this.storeProps(requestKey, props);

    return this.addInstance(requestKey);
  }

  async start(requestKey: RequestKey) {

    // TODO: првоерить идет ли уже запрос
    //       если это сохранение то поставить в очередь после текущего
    //       если это get (isGetting) то отменить запрос

    // set state of start loading
    this.mold.storage.patch(requestKey, { pending: true });

    const requestProps: ActionProps | undefined = this.getProps(requestKey);

    if (!requestProps) {
      throw new Error(`Can't find request props of "${JSON.stringify(requestKey)}"`);
    }

    let response: BackendResponse;

    try {
      response = await this.mold.backend.request(
        requestKey[REQUEST_KEY_POSITIONS.backend],
        requestProps
      );
    }
    catch (e) {
      // actually this is for error in the code not network or backend's error
      this.mold.storage.patch(requestKey, {
        pending: false,
        finishedOnce: true,
        responseSuccess: false,
        responseStatus: REQUEST_STATUSES.fatalError,
        responseErrors: [{code: REQUEST_STATUSES.fatalError, message: "Fatal error"}],
        // it doesn't clear previous result
      });
      // log error because it isn't a network or backend's error
      this.mold.log.error(e);
      // do nothing else actually
      return;
    }
    // success
    this.mold.storage.patch(requestKey, {
      pending: false,
      finishedOnce: true,
      responseSuccess: true,
      responseStatus: response.status,
      responseErrors: response.errors,
      result: response.result,
    });
  }

  destroyInstance(instanceId: string) {
    const {requestKey, instanceNum} = splitInstanceId(instanceId);
    const requestKeyStr: string = requestKeyToString(requestKey);
    const requestInstances: string[] | undefined = this.instances[requestKeyStr];
    // do nothing if there isn't a request
    if (!requestInstances) return;
    // TODO: test
    const index: number = requestInstances.indexOf(instanceNum);
    // TODO: test
    requestInstances.splice(index, 1);
    // if it has some other instances then do nothing
    if (requestInstances.length) return;
    // else remove the request and state
    // remove request props
    this.removeProps(requestKey);
    // remove state
    this.mold.storage.delete(requestKey);
  }


  private addInstance(requestKey: RequestKey): string {
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

  private removeProps(requestKey: RequestKey) {
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
  private storeProps(requestKey: RequestKey, props: ActionProps) {
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
