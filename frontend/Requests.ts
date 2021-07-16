import Mold from './Mold'
import {REQUEST_KEY_POSITIONS, RequestKey} from './interfaces/RequestKey'
import {ActionProps} from './interfaces/ActionProps'
import {MoldResponse} from '../interfaces/MoldResponse'
import {makeFatalErrorResponse, makeRequest} from '../helpers/helpers'
import {MoldRequest, MoldRequestData} from '../interfaces/MoldRequest'
import {ActionState} from './interfaces/ActionState'
import QueueRace from '../helpers/QueueRace'
import {omitObj, sortObject} from '../helpers/objects'
import {makeUniqId} from 'squidlet-lib/src/uniqId'
import {INSTANCE_ID_LENGTH} from './constants'
import {JsonTypes} from '../interfaces/Types'


export default class Requests {
  private readonly mold: Mold
  // object like { requestKeyStr: QueueRace }
  private writingQueues: Record<string, QueueRace> = {}


  constructor(mold: Mold) {
    this.mold = mold
  }

  destroy() {
    for (let key of Object.keys(this.writingQueues)) {
      this.writingQueues[key].destroy()
    }

    this.writingQueues = {}
  }


  getProps(instanceId: string): ActionProps | undefined {
    return this.mold.storageManager.getProps(instanceId)
  }

  // eachAction(
  //   backendName: string,
  //   set: string,
  //   cb: (actionName: string, actionRequests: {[index: string]: ActionProps}) => void
  // ) {
  //   this.instances.eachAction(backendName, set, cb)
  // }

  doesInstanceExist(instanceId: string): boolean {
    return this.mold.storageManager.hasState(instanceId)
  }

  waitRequestFinished(instanceId: string): Promise<void> {
    const state: ActionState | undefined = this.mold.storageManager.getState(instanceId)

    if (!state || !state.pending) return Promise.resolve()

    return new Promise((resolve, reject) => {
      const handleIndex: number = this.mold.storageManager.onChange(
        instanceId,
        (state: ActionState) => {
          if (state.pending) return

          this.mold.storageManager.removeListener(handleIndex)
          clearTimeout(timeout)
          resolve()
        }
      )
      // wait 60 seconds in case if something is going wrong
      // it a good wait change handler has to catch changing of pending state.
      const timeout = setTimeout(() => {
        this.mold.storageManager.removeListener(handleIndex)
        reject(`Timeout has been exceeded`)
      }, this.mold.config.requestTimeoutSec * 1000)
    })
  }

  /**
   * Creates new instance
   * @return {string} An instance id
   */
  register(props: ActionProps): string {
    const instanceId: string = makeUniqId(INSTANCE_ID_LENGTH)
    // init state if it doesn't exist
    this.mold.storageManager.initStateIfNeed(instanceId, {
      ...props,
      isReading: (typeof props.isReading === 'undefined')
        ? (props.action === 'find' || props.action === 'get')
        : props.isReading,
    })

    return instanceId
  }

  destroyInstance(instanceId: string) {
    if (this.writingQueues[requestKeyStr]) {
      this.writingQueues[requestKeyStr].destroy();

      delete this.writingQueues[requestKeyStr]
    }
    // do nothing if there isn't any request
    if (!this.instances.getProps(requestKey)) return
    // remove instance and request if there aren't any more instances
    this.instances.removeInstance(instanceId)
    // remove storage state if request has been destroyed
    if (!this.instances.getProps(requestKey)) this.mold.storageManager.delete(requestKey)
  }

  /**
   * Start request which was registered previously
   * @param instanceId
   * @param data - data for create, patch or custom actions
   * @param queryOverride - override some query params
   */
  async startRequest(
    instanceId: string,
    data?: MoldRequestData,
    queryOverride?: Record<string, JsonTypes>
  ) {
    if (!this.mold.storageManager.hasState(instanceId)) {
      throw new Error(`Instance "${instanceId}" doesn't exists`)
    }

    const actionProps: ActionProps | undefined = this.getProps(instanceId)
    // check is it reading request. Data isn't used in read requests.
    if (actionProps!.isReading) return this.doReadRequest(instanceId, actionProps!, queryOverride)

    // TODO: add queryOverride
    // TODO: что если data явно передана как undefined???

    // else is writing - put it to queue if there isn't the same request.
    const queue: QueueRace = this.resolveWritingQueue(requestKey)
    const jobId: string = JSON.stringify(sortObject(data || {}))
    // Check is this job is in queue to reduce duplicates.
    // If found then it returns the promise of the same job in queue
    if (queue.hasJob(jobId)) return queue.waitJobFinished(jobId)
    // make request here to clone it
    const request: MoldRequest = makeRequest(actionProps, data)
    // push it to queue
    await queue.add(() => this.doWriteRequest(requestKey, request), jobId)
  }


  private async doReadRequest(
    instanceId: string,
    actionProps: ActionProps,
    queryOverride?: Record<string, JsonTypes>
  ) {
    const state: ActionState | undefined = this.mold.storageManager.getState(instanceId)

    if (!state) {
      throw new Error(`Can't find state of instance "${instanceId}"`)
    }
    else if (state.pending) {
      // return a promise which will be resolved after current request is finished
      return this.waitRequestFinished(instanceId)
    }
    // else request is done or fresh at the moment then do a new request
    const request: MoldRequest = makeRequest(actionProps, undefined, queryOverride)
    let response: MoldResponse

    // set pending state
    this.mold.storageManager.patch(instanceId, { pending: true })

    try {
      response = await this.mold.backendManager.request(request, actionProps.backend)
    }
    catch (e) {
      // actually this is for error in the code not network or backend's error
      this.mold.storageManager.patch(instanceId, {
        pending: false,
        finishedOnce: true,
        // it doesn't clear previous result
        ...omitObj(makeFatalErrorResponse(e), 'result'),
      })
      // and throw an error any way
      throw e
    }
    // success of response. It also can contain an error status.
    this.mold.storageManager.patch(instanceId, {
      pending: false,
      finishedOnce: true,
      ...response,
    })
  }

  /**
   * This is called in the queue of specified requestKey
   * @private
   */
  private async doWriteRequest(
    instanceId: string,
    actionProps: ActionProps,
    request: MoldRequest
  ) {

    // TODO: add queryOverride

    // If it is the fresh request(first job) then switch a pending state to true
    if (!this.mold.storageManager.getState(requestKey)!.pending) {
      this.mold.storageManager.patch(requestKey, { pending: true });
    }


    let response: MoldResponse;

    try {
      response = await this.mold.backendManager.request(request, actionProps.backend)
    }
    catch (e) {
      this.handleEndOfWritingResponse(requestKey, makeFatalErrorResponse(e));
      // and throw an error any way
      throw e;
    }

    this.handleEndOfWritingResponse(requestKey, response);
  }

  private handleEndOfWritingResponse(requestKey: RequestKey, response: MoldResponse) {
    const requestKeyStr: string = requestKeyToString(requestKey);

    if (this.writingQueues[requestKeyStr].getQueueLength()) {
      // don't set pending to false but adjust response state
      this.mold.storageManager.patch(requestKey, {
        ...response,
        finishedOnce: true,
      });
    }
    else {
      // If there aren't any jobs in the queue then set pending to false,
      // And adjust response state.
      // This means all the requests are finished
      this.mold.storageManager.patch(requestKey,{
        ...response,
        pending: false,
        finishedOnce: true,
      });
    }
  }

  private resolveWritingQueue(requestKey: RequestKey): QueueRace {
    const requestKeyStr: string = requestKeyToString(requestKey);

    if (!this.writingQueues[requestKeyStr]) {
      this.writingQueues[requestKeyStr] = new QueueRace(this.mold.config.jobTimeoutSec);
    }

    return this.writingQueues[requestKeyStr];
  }

}
