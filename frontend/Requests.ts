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
  private mold: Mold;
  // like { requestKeyStr: Queue }
  private writingQueues: Record<string, Queue> = {};
  private readonly instances: InstancesStore;


  constructor(mold: Mold) {
    this.mold = mold;
    this.instances = new InstancesStore();
  }

  destroy() {
    for (let key of Object.keys(this.writingQueues)) {
      this.writingQueues[key].destroy();
    }

    this.writingQueues = {};

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
   * Start a new request by instanceId
   * @param instanceId
   * @param data - data for create, patch or custom actions
   */
  async startInstance(instanceId: string, data?: Record<string, any>) {
    const {requestKey, instanceNum} = splitInstanceId(instanceId);

    if (!this.instances.doesInstanceNumExist(requestKey, instanceNum)) {
      throw new Error(`Instance "${instanceId}" doesn't exists`);
    }

    await this.startRequest(requestKey, data);
  }

  /**
   * Start a new request by requestKey
   * @param requestKey
   * @param data - data for create, patch or custom actions
   */
  async startRequest(requestKey: RequestKey, data?: Record<string, any>) {
    const actionProps: ActionProps | undefined = this.getProps(requestKey);
    const state: ActionState | undefined = this.mold.storageManager.getState(requestKey);

    if (!actionProps) throw new Error(`No props of "${JSON.stringify(requestKey)}"`);
    if (!state) throw new Error(`Can't find state of "${JSON.stringify(requestKey)}"`);
    // check is it reading request
    if (actionProps.isReading) {
      // TODO: все перенести в doReadRequest
      if (state.pending) {
        // return a promise which will be resolved after current request is finished
        return this.waitRequestFinished(requestKey);
      }
      else {
        // else no one reading request then do fresh request
        const request: MoldRequest = makeRequest(actionProps, data);

        return await this.doReadRequest(requestKey, request);
      }
    }
    // else is writing - put it to queue if there isn't the same request.
    const jobId: string = JSON.stringify(sortObject(data || {}));
    const queue: Queue = this.resolveQueue(requestKey);
    // check is this job is in queue to reduce duplicates
    if (queue.hasJob(jobId)) {
      return queue.waitJobFinished(jobId);
    }
    // make request here to clone it
    const request: MoldRequest = makeRequest(actionProps, data);
    // push it to queue
    await queue.add(() => this.doWriteRequest(requestKey, request), jobId);
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


  private async doReadRequest(requestKey: RequestKey, request: MoldRequest) {

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

  private async doWriteRequest(requestKey: RequestKey, request: MoldRequest) {
    const requestKeyStr: string = requestKeyToString(requestKey);
    const filteredJobsIds: string[] = this.writingQueue.getJobIds()
      .filter((id: string) => id.indexOf(requestKeyStr) >= 0);

    if (filteredJobsIds.length) {
      // TODO: если стейт pendig не стоит true то сделать true
      this.mold.storageManager.patch(requestKey, { pending: true });
    }

    const response: MoldResponse = await this.doSafeRequest(requestKey, request);

    // TODO: если кроме текущего job нет других job то считаем что очередь завершилась
    //       и устанавливаем стейт

  }

  private async doSafeRequest(
    requestKey: RequestKey,
    request: MoldRequest
  ): Promise<MoldResponse> {
    const backendName: string = requestKey[REQUEST_KEY_POSITIONS.backend];

    try {
      return await this.mold.backendManager.request(backendName, request);
    }
    catch (e) {
      // log error because it isn't a network or backend's error
      this.mold.log.debug(e);
      // actually this is for error in the code not network or backend's error
      return {
        success: false,
        // TODO: review
        status: REQUEST_STATUSES.fatalError,
        errors: [{code: REQUEST_STATUSES.fatalError, message: String(e)}],
        // TODO: review - не должен потом затереть текущий result
        result: null,
      }
    }
  }

  private resolveQueue(requestKey: RequestKey): Queue {
    const requestKeyStr: string = requestKeyToString(requestKey);

    if (!this.writingQueues[requestKeyStr]) {
      this.writingQueues[requestKeyStr] = new Queue(this.mold.config.jobTimeoutSec);
    }

    return this.writingQueues[requestKeyStr];
  }

}

// getWritingQueue(requestKey: RequestKey): Queue | string {
//   return this.writingQueues[requestKeyToString(requestKey)];
// }
