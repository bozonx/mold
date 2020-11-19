import {ActionProps} from './interfaces/MethodsProps';
import {ActionState} from './interfaces/MethodsState';
import StorageManager from './StorageManager';
import BackendManager from './BackendManager';
import {splitInstanceId} from '../helpers/common';
import PushesManager, {PushIncomeMessage} from './PushesManager';
import MoldFrontendProps from './interfaces/MoldFrontendProps';
import Requests from './Requests';
import {Logger} from './interfaces/Logger';
import {defaultConfig} from './defaultConfig';
import {isEmptyObject} from '../helpers/objects';
import ConsoleLogger from './ConsoleLogger';
import DefaultStore from './DefaultStore';


export default class Mold {
  readonly props: MoldFrontendProps;
  readonly backend: BackendManager;
  readonly push: PushesManager;
  readonly storage: StorageManager;
  readonly requests: Requests;

  get log(): Logger {
    return this.props.logger;
  }


  constructor(props: Partial<MoldFrontendProps>) {
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
   * Start the request which is corresponding to the instanceId.
   * @param instanceId
   * @param data will be passed to request's data param.
   */
  start(instanceId: string, data?: Record<string, any>) {
    const {requestKey, instanceNum} = splitInstanceId(instanceId);

    if (!this.requests.doesInstanceNumExist(requestKey, instanceNum)) {
      throw new Error(`Instance "${instanceId}" doesn't exists`);
    }

    this.requests.start(requestKey, data)
      .catch(this.log.error);
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


  private prepareProps(props: Partial<MoldFrontendProps>): MoldFrontendProps {
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
      logger: (props.logger) ? props.logger : new ConsoleLogger(),
    };
  }

}
