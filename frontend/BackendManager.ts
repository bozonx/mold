import {ActionProps, MethodPropsBase} from './interfaces/MethodsProps';
import Mold from './Mold';
import {RequestKey, REQUEST_KEY_POSITOINS} from './interfaces/RequestKey';
import BackendClient from '../interfaces/BackendClient';
import BackendRequest from '../interfaces/BackendRequest';
import BackendResponse, {ResponseError} from '../interfaces/BackendResponse';
import {JsonData} from '../interfaces/Types';


export default class BackendManager {
  private readonly mold: Mold;

  // TODO: надо хранить иерархией
  // object like { "backend|set|action|request": { ...props } }
  //private requests: {[index: string]: {[index: string]: FindMethodProps | MethodPropsBase}} = {};


  constructor(mold: Mold) {
    this.mold = mold;
  }

  async fetch<T = any>(
    requestKey: RequestKey,
    props: ActionProps & {action: string}
  ): Promise<BackendResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 200,
          errors: null,
          result: {
            items: [
              { name: 'fff' }
            ]
          }
        })
      }, 1000)
    });
  }
  //
  // // TODO: props можно без backend и set
  // async find<T = any>(requestKey: RequestKey, props: FindMethodProps): Promise<FindResponse<T>> {
  //   this.storeRequest(requestKey, props);
  //
  //   const backendName: string = requestKey[REQUEST_KEY_POSITOINS.backend];
  //
  //   if (!this.mold.props.backends[backendName]) {
  //     throw new Error(
  //       `BackendManager.find: Backend "${backendName}" hasn't been defined ` +
  //       `in the mold frontend config.`
  //     );
  //   }
  //
  //   const backendClient: BackendClient = this.mold.props.backends[backendName];
  //   // TODO: add type
  //   const request: BackendRequest = {
  //     action: 'find',
  //     // TODO: add
  //   };
  //   let response: BackendResponse;
  //
  //   try {
  //     response = backendClient.request(request);
  //   }
  //   catch (e) {
  //     // TODO: если это новый реквест то можно задестроить,
  //     //  если нет то наверное добавить ошибку в стейт
  //     // actually error shouldn't be real. Because request errors are in the result.
  //     //this.destroyRequest(requestKey);
  //
  //     throw e;
  //   }
  //
  //   // TODO: бэкэнд должен всегда возвращать resolved
  //
  //
  // }
  //
  // async get<T>(requestKey: RequestKey, props: GetMethodProps): Promise<GetResponse<T>> {
  //   // TODO: add
  // }
  //
  //
  // private storeRequest(requestKey: RequestKey, props: FindMethodProps) {
  //   // TODO: add
  // }

}
