import {REQUEST_KEY_POSITIONS, RequestKey} from './interfaces/RequestKey';
import {ActionProps} from './interfaces/ActionProps';
import Mold from './Mold';
import {MoldResponse} from '../interfaces/MoldResponse';
import {makeRequest, makeRequestKey, splitInstanceId} from '../helpers/helpers';
import {InstancesStore} from './InstancesStore';
import {MoldRequest} from '../interfaces/MoldRequest';
import {omitUndefined} from '../helpers/objects';
import {REQUEST_STATUSES} from '../shared/constants';
import {ActionState} from './interfaces/ActionState';


export default class Requests {
  private mold: Mold;
  readonly instances: InstancesStore;


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
    this.mold.storageManager.initStateIfNeed(requestKey);
    // put or update request props into store and make instance ot it
    return this.instances.addInstance(requestKey, {
      ...props,
      isReading: (typeof props.isReading === 'undefined')
        ? (props.action === 'find' || props.action === 'get')
        : props.isReading,
    });
  }

  /**
   * Start a new request
   * @param instanceId
   * @param data - data for create, delete, patch or custom actions
   */
  async startInstance(instanceId: string, data?: Record<string, any>) {
    const {requestKey, instanceNum} = splitInstanceId(instanceId);

    if (!this.instances.doesInstanceNumExist(requestKey, instanceNum)) {
      throw new Error(`Instance "${instanceId}" doesn't exists`);
    }

    await this.startRequest(requestKey, data);
  }

  async startRequest(requestKey: RequestKey, data?: Record<string, any>) {
    const actionProps: ActionProps | undefined = this.getProps(requestKey);
    const state: ActionState | undefined = this.mold.storageManager.getState(requestKey);

    if (!actionProps) throw new Error(`No props of "${JSON.stringify(requestKey)}"`);
    if (!state) throw new Error(`Can't find state of "${JSON.stringify(requestKey)}"`);

    if (actionProps.isReading) {
      if (state.pending) {
        // return a promise which will be resolved after current request is finished
        return this.waitRequestFinished(requestKey);
      }
      else {
        // else no one reading request then do fresh request
        const request: MoldRequest = makeRequest(actionProps, data);

        return await this.doRequest(requestKey, request);
      }
    }
    // is writing
    if (state.pending) {
      // TODO: поставить в очередь и запустить запрос как только выполнится
      //       текущий запрос. И перезаписывать колбэк при новых запросах
    }

    const request: MoldRequest = makeRequest(actionProps, data);

    // do fresh request
    await this.doRequest(requestKey, request);
  }

  // TODO: remake
  waitRequestFinished(requestKey: RequestKey): Promise<void> {
    const state: ActionState | undefined = this.getState(instanceId);

    if (!state || !state.pending) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const handleIndex: number = this.onChange(instanceId, (state: ActionState) => {
        if (state.pending) return;

        this.removeListener(handleIndex);
        clearTimeout(timeout);
        resolve();
      });
      // wait 60 seconds in case if something is going wrong
      // it a good wait change handler has to catch changing of pending state.
      const timeout = setTimeout(() => {
        this.removeListener(handleIndex);
        reject(`Timeout has been exceeded`);
      }, this.config.requestTimeoutSec * 1000);
    });
  }

  destroyInstance(instanceId: string) {
    const {requestKey} = splitInstanceId(instanceId);
    // do nothing if there isn't any request
    if (!this.instances.getProps(requestKey)) return;
    // remove instance and request if there aren't any more instances
    this.instances.removeInstance(instanceId);
    // remove storage state if request has been destroyed
    if (!this.instances.getProps(requestKey)) this.mold.storageManager.delete(requestKey);
  }


  private async doRequest(requestKey: RequestKey, request: MoldRequest) {

    // TODO: ждать 60 сек до конца и поднимать ошибку и больше не принимать ответ

    const backendName: string = requestKey[REQUEST_KEY_POSITIONS.backend];
    let response: MoldResponse;

    // set pending state
    this.mold.storageManager.patch(requestKey, { pending: true });

    // TODO: review - поднимет fatal ошибку
    try {
      response = await this.mold.backendManager.request(backendName, request);
    }
    catch (e) {
      // actually this is for error in the code not network or backend's error
      this.mold.storageManager.patch(requestKey, {
        pending: false,
        finishedOnce: true,
        success: false,
        // TODO: review
        status: REQUEST_STATUSES.fatalError,
        errors: [{code: REQUEST_STATUSES.fatalError, message: String(e)}],
        // it doesn't clear previous result
      });
      // log error because it isn't a network or backend's error
      this.mold.log.error(e);
      // do nothing else actually
      return;
    }
    // success of response. It also can contain an error status.
    this.mold.storageManager.patch(requestKey, {
      pending: false,
      finishedOnce: true,
      ...response,
    });
  }

}

// private makeRequestProps(
//   requestKey: RequestKey,
//   data?: Record<string, any>,
//   queryOverride?: Record<string, any>
// ): MoldRequest {
//   const actionProps: ActionProps | undefined = this.getProps(requestKey);
//
//   if (!actionProps) {
//     throw new Error(`Can't find request props of "${JSON.stringify(requestKey)}"`);
//   }
//
//   const request: MoldRequest = {
//     ...makeRequest(actionProps),
//     data: (actionProps.data || data) && {
//       ...actionProps.data,
//       ...data,
//     },
//     query: (actionProps.query || queryOverride) && {
//       ...actionProps.query,
//       ...queryOverride,
//     },
//   }
//
//   return omitUndefined(request) as MoldRequest;
// }
