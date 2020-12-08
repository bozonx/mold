import {REQUEST_KEY_POSITIONS, RequestKey} from './interfaces/RequestKey';
import {ActionProps} from './interfaces/ActionProps';
import Mold from './Mold';
import {MoldResponse} from '../interfaces/MoldResponse';
import {makeRequest, makeRequestKey, requestKeyToString, splitInstanceId} from '../helpers/helpers';
import {InstancesStore} from './InstancesStore';
import {MoldRequest} from '../interfaces/MoldRequest';
import {REQUEST_STATUSES} from '../shared/constants';
import {ActionState} from './interfaces/ActionState';
import Queue from '../helpers/Queue';
import {sortObject} from '../helpers/objects';


export default class Requests {
  readonly instances: InstancesStore;

  private mold: Mold;
  private writingQueue: Queue;


  constructor(mold: Mold) {
    this.mold = mold;
    this.instances = new InstancesStore();
    this.writingQueue = new Queue(this.mold.config.jobTimeoutSec);
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

  waitRequestFinished(requestKey: RequestKey): Promise<void> {
    const state: ActionState | undefined = this.mold.storageManager.getState(requestKey);

    if (!state || !state.pending) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const handleIndex: number = this.mold.storageManager.onChange(requestKey, (state: ActionState) => {
        if (state.pending) return;

        this.mold.storageManager.removeListener(handleIndex);
        clearTimeout(timeout);
        resolve();
      });
      // wait 60 seconds in case if something is going wrong
      // it a good wait change handler has to catch changing of pending state.
      const timeout = setTimeout(() => {
        this.mold.storageManager.removeListener(handleIndex);
        reject(`Timeout has been exceeded`);
      }, this.mold.config.requestTimeoutSec * 1000);
    });
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
    // is writing - put it to queue if there isn't the same request.
    const requestKeyStr: string = requestKeyToString(requestKey);
    const dataString: string = JSON.stringify(sortObject(data || {}));
    const jobId: string = `${requestKeyStr}+${dataString}`;

    if (this.writingQueue.hasJob(jobId)) {
      // TODO: return promise of that job id
    }

    // do fresh request
    await this.writingQueue.add(
      () => this.doWriteRequest(requestKey, makeRequest(actionProps, data)),
      jobId
    );
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
    // TODO: если стейт удалился пока шел запрос то нужно ответ игнорировать.
    //       Сам запрос по возможности остановить

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
