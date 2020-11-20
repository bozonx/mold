import {REQUEST_KEY_POSITIONS, RequestKey} from './interfaces/RequestKey';
import {ActionProps} from './interfaces/MethodsProps';
import Mold from './Mold';
import {MoldResponse} from '../interfaces/MoldResponse';
import {makeRequestKey, splitInstanceId} from '../helpers/common';
import {REQUEST_STATUSES} from './constants';
import {InstancesStore} from './InstancesStore';
import MoldRequest from '../interfaces/MoldRequest';
import {omitObj} from '../helpers/objects';


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

    return this.instances.doesInstanceNumExist(requestKey, instanceNum);
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

    if (!this.instances.doesInstanceNumExist(requestKey, instanceNum)) {
      throw new Error(`Instance "${instanceId}" doesn't exists`);
    }

    const actionProps: ActionProps | undefined = this.getProps(requestKey);

    if (!actionProps) throw new Error(`No props of "${instanceId}"`);

    if (this.mold.isPending(instanceId)) {
      if (actionProps.isGetting) {
        // return a promise which will be resolved after current request is finished
        return this.mold.waitRequestFinished(instanceId);
      }
      else {
        // TODO: поставить в очередь и запустить запрос как только выполнится
        //       текущий запрос. И перезаписывать колбэк при новых запросах
        return;
      }
    }
    // do fresh request
    const requestProps = this.makeRequestProps(requestKey, data);

    await this.doRequest(requestKey, requestProps);
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


  private makeRequestProps(
    requestKey: RequestKey,
    data?: Record<string, any>
  ): MoldRequest {
    const actionProps: ActionProps | undefined = this.getProps(requestKey);

    if (!actionProps) {
      throw new Error(`Can't find request props of "${JSON.stringify(requestKey)}"`);
    }

    return {
      ...omitObj(actionProps, 'backend', 'isGetting') as MoldRequest,
      data: {
        ...actionProps.data,
        data,
      },
    }
  }

  private async doRequest(requestKey: RequestKey, requestProps: MoldRequest) {
    const backendName: string = requestKey[REQUEST_KEY_POSITIONS.backend];
    let response: MoldResponse;

    // set pending state
    this.mold.storage.patch(requestKey, { pending: true });

    try {
      response = await this.mold.backend.request(backendName, requestProps);
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
      responseSuccess: response.success,
      responseStatus: response.status,
      responseErrors: response.errors,
      result: response.result,
    });
  }

}
