import {ActionProps} from './interfaces/MethodsProps';
import {ActionState} from './interfaces/MethodsState';
import StorageManager from './StorageManager';
import BackendManager from './BackendManager';
import {splitInstanceId} from '../helpers/common';
import PushesManager, {PushIncomeMessage} from './PushesManager';
import MoldProps from './interfaces/MoldProps';
import Requests from './Requests';
import {Logger, LogLevel} from './interfaces/Logger';
import {defaultConfig} from './defaultConfig';
import {isEmptyObject} from '../helpers/objects';
import ConsoleLogger from './ConsoleLogger';
import DefaultStore from './DefaultStore';
import {MoldFrontendConfig} from './interfaces/MoldFrontendConfig';


export default class Mold {
  readonly props: MoldProps;
  readonly backend: BackendManager;
  readonly push: PushesManager;
  readonly storage: StorageManager;
  readonly requests: Requests;

  get log(): Logger {
    return this.props.log as any;
  }

  get config(): MoldFrontendConfig {
    return this.props.config!;
  }


  constructor(props: Partial<MoldProps>) {
    this.props = this.prepareProps(props);
    this.backend = new BackendManager(this);
    this.push = new PushesManager(this);
    this.storage = new StorageManager(this);
    this.requests = new Requests(this);
  }

  destroy = () => {
    this.push.destroy();
    this.backend.destroy();
    this.storage.destroy();
    this.requests.destroy();
  }


  /**
   * Handle income push message. It can be json string or object or array of messages.
   */
  incomePush(backend: string, message: PushIncomeMessage) {
    this.push.incomePush(backend, message);
  }

  /**
   * It inits request if need and makes a new request instance id.
   * It doesn't start the request itself
   * @return An instance id
   */
  newRequest(actionProps: ActionProps): string {
    return this.requests.register(actionProps);
  }

  /**
   * It receives as instanceId and returns state of request.
   */
  getState(instanceId: string): ActionState | undefined {
    const {requestKey} = splitInstanceId(instanceId);

    return this.storage.getState(requestKey);
  }

  /**
   * Start the request which was added by newRequest() and corresponding to the instanceId.
   * @param instanceId
   * @param data will be passed to request's data param.
   */
  start(instanceId: string, data?: Record<string, any>) {
    this.requests.start(instanceId, data)
      .catch(this.log.error);
  }

  /**
   * Is request is pending
   * @param instanceId
   */
  isPending(instanceId: string): boolean {
    const state: ActionState | undefined = this.getState(instanceId);

    return state && state.pending || false;
  }

  waitRequestFinished(instanceId: string): Promise<void> {
    const state: ActionState | undefined = this.getState(instanceId);

    if (!state || !state.pending) return Promise.resolve();

    return new Promise((resolve) => {

      // TODO: add timeout

      const handleIndex: number = this.onChange(instanceId, (state: ActionState) => {
        if (state.pending) return;

        this.removeListener(handleIndex);
        resolve();
      });
    });
  }

  /**
   * Listen to changes of any part of state of specified request
   * which is resolved by instanceId.
   */
  onChange(instanceId: string, changeCb: (state: ActionState) => void): number {
    const {requestKey} = splitInstanceId(instanceId);
    // listen of changes of just created state or existed
    return this.storage.onChange(requestKey, changeCb);
  }

  removeListener(handleIndex: number) {
    this.storage.removeListener(handleIndex);
  }

  /**
   * Destroy instance of request.
   * And destroy request and state themself if no one instance left.
   */
  destroyInstance = (instanceId: string) => {
    this.requests.destroyInstance(instanceId);
  }


  private prepareProps(props: Partial<MoldProps>): MoldProps {
    if (!props.backends || isEmptyObject(props.backends)) {
      throw new Error(`Please specify almost one backend`);
    }

    return {
      backends: props.backends,
      config: {
        ...defaultConfig,
        ...props.config,
      },
      storage: (props.storage) ? props.storage : new DefaultStore(),
      log: this.resolveLogger(props.log),
    };
  }

  private resolveLogger(rawLogger?: Logger | LogLevel): Logger {
    if (!rawLogger) return new ConsoleLogger();

    if (typeof rawLogger === 'string') return new ConsoleLogger(rawLogger);

    return rawLogger;
  }

}
