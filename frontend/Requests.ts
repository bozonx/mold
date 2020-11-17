import {REQUEST_KEY_POSITIONS, RequestKey} from './interfaces/RequestKey';
import {ActionProps} from './interfaces/MethodsProps';
import RequestInstances from './RequestInstances';
import Mold from './Mold';
import BackendResponse from '../interfaces/BackendResponse';



// This is for RequestsCollection's items
//export type RequestCollectionItem = Omit<Omit<Omit<ActionProps, 'backend'>, 'set'>, 'action'>;


export default class Requests {
  private mold: Mold;
  //readonly instances: RequestInstances;


  constructor(mold: Mold) {
    this.mold = mold;
    //this.instances = new RequestInstances();

  }


  register(requestKey: RequestKey, props: ActionProps): string {
    // init state if it doesn't exist
    this.mold.storage.initStateIfNeed(requestKey);
    //this.requests.register(requestKey, omitObj(actionProps, 'backend', 'set', 'action'));

    //return this.instances.add(requestKey);
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

  destroyInstance = (instanceId: string) => {
    //this.storage.destroyRequest(requestKey);
    //this.backend.destroyRequest(requestKey);

    // TODO: удалять только если нет больше инстансов
    // TODO: push тоже ???
  }

  destroy() {
    // TODO: add
    //this.instances.destroy();
  }

}
