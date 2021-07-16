import {ActionProps} from './interfaces/ActionProps'
import {ActionState} from './interfaces/ActionState'
import StorageManager from './StorageManager'
import BackendManager from './BackendManager'
import {MoldProps} from './interfaces/MoldProps'
import Requests from './Requests'
import {Logger, LogLevel} from '../interfaces/Logger'
import {defaultConfig} from './defaultConfig'
import {isEmptyObject} from '../helpers/objects'
import ConsoleLogger from '../helpers/ConsoleLogger'
import DefaultStore from './DefaultStore'
import {MoldFrontendConfig} from './interfaces/MoldFrontendConfig'
import {MoldRequestData} from '../interfaces/MoldRequest'
import {JsonTypes} from '../interfaces/Types'


export default class Mold {
  readonly props: MoldProps
  readonly requests: Requests
  readonly backendManager: BackendManager
  //readonly pushManager: PushesManager
  readonly storageManager: StorageManager
  readonly initPromise: Promise<void>

  get log(): Logger {
    return this.props.log as any
  }

  get config(): MoldFrontendConfig {
    return this.props.config as Required<MoldFrontendConfig>
  }


  constructor(props: Partial<MoldProps>) {
    this.props = this.prepareProps(props)
    this.requests = new Requests(this)
    this.backendManager = new BackendManager(this)
    //this.pushManager = new PushesManager(this)
    this.storageManager = new StorageManager(this)

    this.initPromise = this.doInit()
  }

  destroy = async () => {
    //this.pushManager.destroy()
    this.storageManager.destroy()
    this.requests.destroy()
    await this.backendManager.destroy()
  }


  // /**
  //  * Handle income push message. It can be json string or object or array of messages.
  //  * If the message is invalid then an error will be thrown
  //  */
  // incomePush(backend: string, message: PushIncomeMessage) {
  //   this.pushManager.incomePush(backend, message)
  // }
  //
  // /**
  //  * As incomePush() but error safe.
  //  */
  // incomePushSafe(backend: string, message: PushIncomeMessage) {
  //   try {
  //     this.pushManager.incomePush(backend, message)
  //   }
  //   catch (e) {
  //     this.log.error(e)
  //   }
  // }

  /**
   * It receives an instanceId and returns state of request.
   */
  getState(instanceId: string): ActionState | undefined {
    return this.storageManager.getState(instanceId)
  }

  /**
   * It inits request if need and makes a new request instance id.
   * It doesn't start the request
   * @return {String} an instance id
   */
  newRequest(actionProps: ActionProps): string {
    return this.requests.register(actionProps)
  }

  /**
   * Start the request which was added by newRequest()
   * and corresponding to the instanceId.
   * @param instanceId
   * @param data will be passed to request's data param.
   * @param queryOverride - override some query params
   */
  start(
    instanceId: string,
    data?: MoldRequestData,
    queryOverride?: Record<string, JsonTypes>
  ) {
    this.requests.startRequest(instanceId, data, queryOverride)
      .catch(this.log.error)
  }

  startAsync(
    instanceId: string,
    data?: MoldRequestData,
    queryOverride?: Record<string, JsonTypes>
  ): Promise<void> {
    return this.requests.startRequest(instanceId, data, queryOverride)
  }

  /**
   * All in one. Useful for debug.
   */
  doRequest(actionProps: ActionProps): ActionState {
    const instanceId = this.requests.register(actionProps)
    const state = this.getState(instanceId)

    if (!state) throw new Error(`No state`)

    this.onChange(instanceId, (newState: ActionState) => {
      Object.assign(state, newState)
    })

    this.requests.startRequest(instanceId, actionProps.data)
      .catch(this.log.error)

    return state
  }

  /**
   * Is request or instance is pending
   * @param instanceId
   */
  isPending(instanceId: string): boolean {
    const state: ActionState | undefined = this.getState(instanceId)

    return state?.pending || false
  }

  /**
   * Wait while request is finished but not greater then 60 seconds.
   */
  waitRequestFinished(instanceId: string): Promise<void> {
    return this.requests.waitRequestFinished(instanceId)
  }

  /**
   * Listen to changes of any part of state of specified request
   * which is resolved by instanceId.
   * This is certainly changes of state storage.
   */
  onChange(instanceId: string, changeCb: (state: ActionState) => void): number {
    // listen of changes of just created state or existed
    return this.storageManager.onChange(instanceId, changeCb)
  }

  removeListener(handleIndex: number) {
    this.storageManager.removeListener(handleIndex)
  }

  /**
   * Destroy instance of request.
   * And destroy request and state themself if no one instance left.
   */
  destroyInstance = (instanceId: string) => {
    this.requests.destroyInstance(instanceId)
  }


  private prepareProps(props: Partial<MoldProps>): MoldProps {
    if (!props.backends || isEmptyObject(props.backends)) {
      throw new Error(`Please specify almost one backend`)
    }

    return {
      //production: props.production || false,
      backends: props.backends || {},
      config: {
        ...defaultConfig,
        ...props.config,
      },
      storage: (props.storage) ? props.storage : new DefaultStore(),
      log: this.resolveLogger(props.log),
    };
  }

  private resolveLogger(rawLogger?: Logger | LogLevel): Logger {
    if (!rawLogger) return new ConsoleLogger()

    if (typeof rawLogger === 'string') return new ConsoleLogger(rawLogger)

    return rawLogger
  }

  private async doInit() {
    await this.backendManager.init()
  }

}
