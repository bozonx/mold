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
  }

  destroy() {
  }


  getBackendClient(backendName: string): BackendClient {
    if (!this.mold.props.backends[backendName]) {
      throw new Error(`Can't find backend client "${backendName}"`);
    }

    return this.mold.props.backends[backendName];
  }

  /**
   * It just makes the request to the specified backend client.
   * It doesn't care about are there any other similar requests.
   */
  request<T = any>(backendName: string, props: ActionProps): Promise<BackendResponse> {
    const request: MoldRequest = makeRequest(props);
    const backendClient: BackendClient = this.getBackendClient(backendName);

    return backendClient.request(props.set, request);
  }

}
