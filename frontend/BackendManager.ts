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


  getBackend(backendName: string): BackendClient {
    if (!this.mold.props.backends[backendName]) {
      throw new Error(`Can't find backend client "${backendName}"`);
    }

    return this.mold.props.backends[backendName];
  }

  async request<T = any>(
    // TODO: зачем он нужен тут ??? на этом уровне он не нужен
    //requestKey: RequestKey,
    backendName: string,
    props: ActionProps
  ): Promise<BackendResponse> {
//    this.storeRequest(requestKey, props);

    const request: BackendRequest = this.makeRequest(backendName, props);
    const backend = this.getBackend(backendName);
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


  private makeRequest(backend: string, props: ActionProps): BackendRequest {
    return {
      // TODO: what to add ????
    };
  }

}
