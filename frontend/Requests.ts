import {REQUEST_KEY_POSITIONS, REQUEST_KEY_SEPARATOR, RequestKey} from './interfaces/RequestKey';
import {ActionProps} from './interfaces/MethodsProps';
import Mold from './Mold';
import BackendResponse from '../interfaces/BackendResponse';
import {isEmptyObject} from '../helpers/objects';
import {requestKeyToString} from '../helpers/common';


export default class Requests {
  private mold: Mold;
  // props of requests like { backend: { set: { action: { request: {...props} } } } }
  private requests: {[index: string]: {[index: string]: {[index: string]: {[index: string]: ActionProps}}}} = {};
  // object like: { "backend|set|action|request": ["0", "1", ...] }
  private instances: {[index: string]: string[]} = {};


  constructor(mold: Mold) {
    this.mold = mold;
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

  async start(instanceId: string) {

    let response: BackendResponse;
    // set state of start loading
    this.storage.patch(requestKey, { pending: true });

    // TODO: поидее можно не делать try
    try {
      response = await this.backend.request(requestKey, {
        action: requestKey[REQUEST_KEY_POSITIONS.action],
        ...props,
      });
    }
    catch (e) {
      // TODO: если это новый реквест то можно задестроить,
      //  если нет то наверное добавить ошибку в стейт
      // actually error shouldn't be real. Because request errors are in the result.
      //this.destroyRequest(requestKey);

      throw e;
    }

    this.storage.patch(requestKey, {
      pending: false,
      finishedOnce: true,
      responseStatus: response.status,
      responseErrors: response.errors,
      result: response.result,
    });
  }

  destroy() {
    // TODO: add
  }


  destroyInstance(instanceId: string) {
    // TODO: удалить хранилище только если не осталось инстансов

    //this.storage.destroyRequest(requestKey);
    //this.backend.destroyRequest(requestKey);

    // TODO: удалять только если нет больше инстансов
    // TODO: push тоже ???
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

  // /**
  //  * Get list of instances nums of request
  //  * @private
  //  */
  // private getInstanceNums(requestKey: RequestKey): string[] | undefined {
  //   const requestKeyStr: string = requestKeyToString(requestKey);
  //
  //   return this.instances[requestKeyStr];
  // }

  private removeProps(requestKey: RequestKey) {
    const {backend, set, action, request} = REQUEST_KEY_POSITIONS;

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
    const {backend, set, action, request} = REQUEST_KEY_POSITIONS;

    if (!this.requests[requestKey[backend]]) {
      this.requests[requestKey[backend]] = {};
    }

    if (!this.requests[requestKey[backend]][set]) {
      this.requests[requestKey[backend]][set] = {};
    }

    if (!this.requests[requestKey[backend]][set][action]) {
      this.requests[requestKey[backend]][set][action] = {};
    }

    this.requests[requestKey[backend]][set][action][request] = props;
  }

}
