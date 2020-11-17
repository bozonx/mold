import {ActionProps} from './interfaces/MethodsProps';
import Mold from './Mold';
import BackendClient from '../interfaces/BackendClient';
import BackendRequest from '../interfaces/BackendRequest';
import BackendResponse from '../interfaces/BackendResponse';


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
    const request: BackendRequest = this.makeRequest(backendName, props);
    const backendClient: BackendClient = this.getBackendClient(backendName);

    return backendClient.request(request);
  }


  private makeRequest(backend: string, props: ActionProps): BackendRequest {
    return {
      // TODO: what to add ????
    };
  }

}
