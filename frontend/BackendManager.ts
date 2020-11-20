import {ActionProps} from './interfaces/MethodsProps';
import Mold from './Mold';
import BackendClient from '../interfaces/BackendClient';
import MoldRequest from '../interfaces/MoldRequest';
import BackendResponse from '../interfaces/BackendResponse';
import {makeRequest} from '../helpers/common';


/**
 * It makes a requests to corresponding backend specified in Mold config.
 */
export default class BackendManager {
  private readonly mold: Mold;


  constructor(mold: Mold) {
    this.mold = mold;
    // init all the backend clients
    for (let backendName of Object.keys(this.mold.props.backends)) {
      const backend: BackendClient = this.mold.props.backends[backendName];

      if (backend.$init) {
        backend.$init(this.mold);
      }
    }
  }

  destroy() {
  }


  getBackendClient(backendName: string): BackendClient {
    if (!this.mold.props.backends?.[backendName]) {
      throw new Error(`Can't find backend client "${backendName}"`);
    }

    return this.mold.props.backends[backendName];
  }

  /**
   * It just makes the request to the specified backend client.
   * It doesn't care about are there any other similar requests.
   */
  request<T = any>(backendName: string, requestProps: MoldRequest): Promise<BackendResponse> {
    const request: MoldRequest = makeRequest(requestProps);
    const backendClient: BackendClient = this.getBackendClient(backendName);

    return backendClient.request(request);
  }

}
