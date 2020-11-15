import {FindResponse, GetResponse} from './interfaces/MethodsState';
import {FindMethodProps, GetMethodProps, MethodPropsBase} from './interfaces/MethodsProps';
import MoldFrontend from './MoldFrontend';
import {RequestKey, RequestKeyPositions} from './interfaces/RequestKey';
import BackendClient from '../interfaces/BackendClient';
import BackendRequest from '../interfaces/BackendRequest';
import BackendResponse from '../interfaces/BackendResponse';


export default class BackendManager {
  private readonly mold: MoldFrontend;

  // TODO: надо хранить иерархией
  // object like { "backend|set|action|request": { ...props } }
  private requests: {[index: string]: {[index: string]: FindMethodProps | MethodPropsBase}} = {};


  constructor(mold: MoldFrontend) {
    this.mold = mold;
  }


  // TODO: props можно без backend и set
  async find<T = any>(requestKey: RequestKey, props: FindMethodProps): Promise<FindResponse<T>> {
    this.saveRequest(requestKey, props);

    const backendName: string = requestKey[RequestKeyPositions.backend];

    if (!this.mold.props.backends[backendName]) {
      throw new Error(
        `BackendManager.find: Backend "${backendName}" hasn't been defined ` +
        `in the mold frontend config.`
      );
    }

    const backendClient: BackendClient = this.mold.props.backends[backendName];
    // TODO: add type
    const request: BackendRequest = {
      action: 'find',
      // TODO: add
    };
    let response: BackendResponse;

    try {
      response = backendClient.request(request);
    }
    catch (e) {
      // TODO: если это новый реквест то можно задестроить,
      //  если нет то наверное добавить ошибку в стейт
      // actually error shouldn't be real. Because request errors are in the result.
      //this.destroyRequest(requestKey);

      throw e;
    }

    // TODO: бэкэнд должен всегда возвращать resolved

    // cb({
    //   loadedOnce: true,
    //   items: [{ id: 0, name: 'aa' }],
    // } as any);
    //
    // setTimeout(() => {
    //   cb({
    //     items: [{ id: 0, name: 'aabb' }, { id: 2, name: 'ggg' }],
    //   } as any);
    // }, 5000)
  }

  async get<T>(requestKey: RequestKey, props: GetMethodProps): Promise<GetResponse<T>> {
    // TODO: add
  }


  private saveRequest(requestKey: RequestKey, props: FindMethodProps) {
    // TODO: add
  }

}
