import {omitObj} from 'squidlet-lib/src/objects'
import {makeUniqId} from 'squidlet-lib/src/uniqId'
import Mold from './Mold'
import {ActionProps} from './interfaces/ActionProps'
import {MoldResponse} from '../interfaces/MoldResponse'
import {makeFatalErrorResponse, makeRequest} from '../helpers/helpers'
import {MoldRequest, MoldRequestData} from '../interfaces/MoldRequest'
import {ActionState} from './interfaces/ActionState'
import {INSTANCE_ID_LENGTH} from './constants'
import {JsonTypes} from '../interfaces/Types'


export default class Requests {
  private readonly mold: Mold


  constructor(mold: Mold) {
    this.mold = mold
  }

  destroy() {
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

          // TODO: если ошибка то надо режектить
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
    if (!this.mold.storageManager.hasState(instanceId)) return

    this.mold.storageManager.delete(instanceId)
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
    const actionProps: ActionProps | undefined = this.getProps(instanceId)

    if (!actionProps) throw new Error(`Instance "${instanceId}" doesn't exists`)
    // check is it reading request and start it. Data isn't used in read requests.
    if (actionProps!.isReading) {
      return this.doReadRequest(instanceId, actionProps!, queryOverride)
    }
    // else start writing request
    await this.doWriteRequest(instanceId, actionProps!, data, queryOverride)
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

      // TODO: что если произошла ошибка в том запросе который ждем??
      //       тогда надо и этот промис режектить

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
    data?: MoldRequestData,
    queryOverride?: Record<string, JsonTypes>
  ) {
    const state: ActionState | undefined = this.mold.storageManager.getState(instanceId)

    if (!state) {
      throw new Error(`Can't find state of instance "${instanceId}"`)
    }
    else if (state.pending) {
      // TODO: что тогда делать??
      // TODO: наверное простая очередь с наложением?
    }

    // TODO: что если data явно передана как undefined???

    const request: MoldRequest = makeRequest(actionProps, data, queryOverride)
    let response: MoldResponse

    try {
      response = await this.mold.backendManager.request(request, actionProps.backend)
    }
    catch (e) {
      this.handleEndOfWritingResponse(instanceId, makeFatalErrorResponse(e))
      // and throw an error any way
      throw e
    }

    this.handleEndOfWritingResponse(instanceId, response)
  }

  private handleEndOfWritingResponse(instanceId: string, response: MoldResponse) {
    this.mold.storageManager.patch(instanceId,{
      ...response,
      // TODO: если идет паралельный запрос то не правильно убирать статус
      pending: false,
      finishedOnce: true,
    })

    // if (this.writingQueues[requestKeyStr].getQueueLength()) {
    //   // don't set pending to false but adjust response state
    //   this.mold.storageManager.patch(requestKey, {
    //     ...response,
    //     finishedOnce: true,
    //   })
    // }
    // else {
    //   // If there aren't any jobs in the queue then set pending to false,
    //   // And adjust response state.
    //   // This means all the requests are finished
    //   this.mold.storageManager.patch(requestKey,{
    //     ...response,
    //     pending: false,
    //     finishedOnce: true,
    //   })
    // }
  }

  // private resolveWritingQueue(requestKey: RequestKey): QueueRace {
  //   const requestKeyStr: string = requestKeyToString(requestKey);
  //
  //   if (!this.writingQueues[requestKeyStr]) {
  //     this.writingQueues[requestKeyStr] = new QueueRace(this.mold.config.jobTimeoutSec);
  //   }
  //
  //   return this.writingQueues[requestKeyStr];
  // }


  // else is writing - put it to queue if there isn't the same request.
  // const queue: QueueRace = this.resolveWritingQueue(requestKey)
  // const jobId: string = JSON.stringify(sortObject(data || {}))
  // Check is this job is in queue to reduce duplicates.
  // If found then it returns the promise of the same job in queue
  //if (queue.hasJob(jobId)) return queue.waitJobFinished(jobId)
  // make request here to clone it

  // // If it is the fresh request(first job) then switch a pending state to true
  // if (!this.mold.storageManager.getState(requestKey)!.pending) {
  //   this.mold.storageManager.patch(requestKey, { pending: true });
  // }


}
