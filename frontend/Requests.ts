import {REQUEST_KEY_POSITIONS, RequestKey} from './interfaces/RequestKey';
import {ActionProps} from './interfaces/MethodsProps';
import Mold from './Mold';
import BackendResponse from '../interfaces/BackendResponse';
import {makeRequestKey, requestKeyToString, splitInstanceId} from '../helpers/common';
import {REQUEST_STATUSES} from './constants';
import {InstancesStore} from './InstancesStore';


export default class Requests {
  private mold: Mold;
  private readonly instances: InstancesStore;

  constructor(mold: Mold) {
    this.mold = mold;
    this.instances = new InstancesStore();
  }

  destroy() {
    this.instances.destroy();
  }


  getProps(requestKey: RequestKey): ActionProps | undefined {
    return this.instances.getProps(requestKey);
  }

  doesInstanceExist(instanceId: string): boolean {
    const {requestKey, instanceNum} = splitInstanceId(instanceId);

    return this.doesInstanceNumExist(requestKey, instanceNum);
  }

  /**
   * Creates storage and register request to further call.
   * @return An instance id
   */
  register(props: ActionProps): string {
    const requestKey: RequestKey = makeRequestKey(props);
    // init state if it doesn't exist
    this.mold.storage.initStateIfNeed(requestKey);
    // put or update request props into store and make instance ot it
    return this.instances.addInstance(requestKey, props);
  }

  async start(instanceId: string, data?: Record<string, any>) {
    const {requestKey, instanceNum} = splitInstanceId(instanceId);

    if (!this.doesInstanceNumExist(requestKey, instanceNum)) {
      throw new Error(`Instance "${instanceId}" doesn't exists`);
    }

    // TODO: првоерить идет ли уже запрос
    //       если это сохранение то поставить в очередь после текущего
    //       если это get (isGetting) то отменить запрос

    // set state of start loading
    this.mold.storage.patch(requestKey, { pending: true });

    // TODO: use "data" of request

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
    const {requestKey} = splitInstanceId(instanceId);
    // do nothing if there isn't any request
    if (!this.instances.getProps(requestKey)) return;
    // remove instance and request if there aren't any more instances
    this.instances.removeInstance(instanceId);
    // remove storage state if request has been destroyed
    if (!this.instances.getProps(requestKey)) this.mold.storage.delete(requestKey);
  }


  private doesInstanceNumExist(requestKey: RequestKey, instanceNum: string): boolean {
    const requestKeyStr: string = requestKeyToString(requestKey);
    const requestInstances: string[] | undefined = this.instances[requestKeyStr];

    // TODO: check storage exists
    // TODO: check props exists

    if (!requestInstances) return false;
    // TODO: test
    return requestInstances.indexOf(instanceNum) >= 0;
  }

}
