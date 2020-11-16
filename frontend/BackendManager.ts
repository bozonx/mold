import {ActionProps} from './interfaces/MethodsProps';
import Mold from './Mold';
import {RequestKey, REQUEST_KEY_POSITIONS} from './interfaces/RequestKey';
import BackendClient from '../interfaces/BackendClient';
import BackendRequest from '../interfaces/BackendRequest';
import BackendResponse from '../interfaces/BackendResponse';
import {isEmptyObject} from '../helpers/objects';


export default class BackendManager {
  private readonly mold: Mold;
  private requests: {[index: string]: {[index: string]: {[index: string]: {[index: string]: ActionProps}}}} = {};


  constructor(mold: Mold) {
    this.mold = mold;
  }


  getBackend(backendName: string): BackendClient {
    if (!this.mold.props.backends[backendName]) {
      throw new Error(`Can't find backend client "${backendName}"`);
    }

    return this.mold.props.backends[backendName];
  }

  async request<T = any>(
    requestKey: RequestKey,
    // TODO: backend и set не нужны, так как есть requestKey
    props: ActionProps & {action: string}
  ): Promise<BackendResponse> {
    this.storeRequest(requestKey, props);

    const backendName: string = requestKey[REQUEST_KEY_POSITIONS.backend];
    const backend = this.getBackend(backendName);
    const request: BackendRequest = this.makeRequest(requestKey, props);
    let response: BackendResponse;

    try {
      response = await backend.request(request);
    }
    catch (e) {
      // TODO: если это новый реквест то можно задестроить,
      //  если нет то наверное добавить ошибку в стейт
      // actually error shouldn't be real. Because request errors are in the result.
      //this.destroyRequest(requestKey);

      throw e;
    }

    // TODO: бэкэнд должен всегда возвращать resolved

    return response;
  }

  destroyRequest(requestKey: RequestKey) {
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

  destroy() {
    // TODO: add!!!
  }


  private makeRequest(requestKey: RequestKey, props: ActionProps): BackendRequest {
    return {
      // TODO: what to add ????
    };
  }

  private storeRequest(requestKey: RequestKey, props: ActionProps) {
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
