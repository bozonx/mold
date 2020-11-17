import {ActionProps} from './interfaces/MethodsProps';
import {ActionState} from './interfaces/MethodsState';
import StorageManager from './StorageManager';
import BackendManager from './BackendManager';
import {makeRequestKey, splitInstanceId} from '../helpers/common';
import PushesManager from './PushesManager';
import MoldFrontendProps from './interfaces/MoldFrontendProps';
import {RequestKey} from './interfaces/RequestKey';
import Requests from './Requests';
import PushMessage from '../interfaces/PushMessage';
import {Logger} from './interfaces/Logger';


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
  incomePush(backend: string, message: string | PushMessage | PushMessage[]) {
    this.push.incomePush(backend, message);
  }

  /**
   * Init request if need and make a new request instance id.
   * It doesn't start the request
   * @return An instance id
   */
  newRequest(actionProps: ActionProps): string {
    const requestKey: RequestKey = makeRequestKey(actionProps);
    // create storage and register request to further call. It returns an instance id;
    return this.requests.register(requestKey, actionProps);
  }

  getState(instanceId: string): ActionState | undefined {
    const {requestKey} = splitInstanceId(instanceId);

    return this.storage.getState(requestKey);
  }

  start(instanceId: string) {
    const {requestKey, instanceNum} = splitInstanceId(instanceId);

    if (!this.requests.doesInstanceNumExist(requestKey, instanceNum)) {
      throw new Error(`Instance "${instanceId}" doesn't exists`);
    }

    this.requests.start(requestKey)
      .catch(this.log.error);
  }

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
   * And destroy request and state themself if not one instance left.
   */
  destroyInstance = (instanceId: string) => {
    this.requests.destroyInstance(instanceId);
  }


  private prepareProps(props: Partial<MoldFrontendProps>): MoldFrontendProps {
    // TODO: check props and merge with defaults
    return props as any;
  }

}
