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


export default class Mold {
  readonly props: MoldFrontendProps;
  readonly backend: BackendManager;
  readonly push: PushesManager;
  readonly storage: StorageManager;
  readonly requests: Requests;


  constructor(props: Partial<MoldFrontendProps>) {
    this.props = this.prepareProps(props);
    this.backend = new BackendManager(this);
    this.push = new PushesManager(this);
    this.storage = new StorageManager(this);
    this.requests = new Requests(this);
  }


  /**
   * Handle income push message. It can be json string or object or array of messages.
   */
  incomePush(backend: string, message: string | PushMessage | PushMessage[]) {
    this.push.incomePush(backend, message);
  }

  /**
   * Init request if need and make a new request instance id
   */
  initRequest(actionProps: ActionProps): string {
    const requestKey: RequestKey = makeRequestKey(actionProps);
    // create storage and register request to further call. It returns an instance id;
    return this.requests.register(requestKey, actionProps);
  }

  getState(instanceId: string): ActionState | undefined {
    const {requestKey} = splitInstanceId(instanceId);

    return this.storage.getState(requestKey);
  }

  start(instanceId: string) {
    this.requests.start(instanceId)
      .catch(this.props.logger.error);
  }

  onChange(instanceId: string, changeCb: (state: ActionState) => void): number {
    const {requestKey} = splitInstanceId(instanceId);
    // listen of changes of just created state or existed
    return this.storage.onChange(requestKey, changeCb);
  }

  removeListener(handleIndex: number) {
    this.storage.removeListener(handleIndex);
  }

  destroyInstance = (instanceId: string) => {
    this.requests.destroyInstance(instanceId);
  }

  destroy = () => {
    this.push.destroy();
    this.backend.destroy();
    this.storage.destroy();
    this.requests.destroy();
  }


  private prepareProps(props: Partial<MoldFrontendProps>): MoldFrontendProps {
    // TODO: check props and merge with defaults
    return props as any;
  }

}


// /**
//  * Call some action at the backend and return its state
//  */
// fetch = <T>(
//   actionProps: ActionProps,
//   changeCb: (state: ActionState<T>) => void
// ): string => {
//   const requestKey: RequestKey = makeRequestKey(actionName, actionProps);
//   // init state if it doesn't exist
//   this.storage.initStateIfNeed(requestKey);
//   // listen of changes of just created state or existed
//   this.storage.onChange(requestKey, changeCb);
//   // make request to the backend at the next tick and update state
//   setTimeout(() => {
//     this.doRequest(requestKey, actionProps)
//       .catch(this.props.logger.error);
//   });
//
//   return this.instances.add(requestKey);
// }

// /**
//  * Save some data to backend. It doesn't return any state.
//  */
// actonSave = async (actionName: string, actionProps: {[index: string]: any}): Promise<void> => {
//   // TODO: add
// }
//
// create = async (props: CreateMethodProps): Promise<void> => {
//   // TODO: add
// }
//
// patch = async (props: PatchMethodProps): Promise<void> => {
//   // TODO: add
// }
//
// /**
//  * Create or update
//  */
// save = async (props: SaveMethodProps): Promise<void> => {
//   // TODO: add
// }
//
// delete = async (props: DeleteMethodProps): Promise<void> => {
//   // TODO: add
// }
//
// batchPatch = async (props: BatchPatchMethodProps): Promise<void> => {
//   // TODO: add
// }
//
// batchDelete = async (props: BatchDeleteMethodProps): Promise<void> => {
//   // TODO: add
// }

// /**
//  * Find several records.
//  * changeCb will be called on any state change - start loading, finish, error and data change.
//  * @return instance id.
//  */
// find = <T>(props: FindMethodProps, changeCb: (state: ListState<T>) => void): string => {
//
//   // TODO: может нет смысла все разделять на отдельные ф-и а просто дерагать action
//
//   const requestKey: RequestKey = makeRequestKey('find', props);
//   // init list state if it doesn't exist
//   this.storage.initListIfNeed(requestKey);
//   // listen of change of just created state or existed
//   this.storage.onChange(requestKey, changeCb);
//   // make request to the backend and update state
//   this.doFindRequest(requestKey, props)
//     .catch(this.props.logger.error);
//
//   return this.instances.add(requestKey);
// }
//
// /**
//  * Get certain record by id
//  */
// get = async <T>(props: GetMethodProps, cb: (state: ItemState<T>) => void): string => {
//   const requestKey: RequestKey = makeRequestKey('get', props);
//   const instanceId: string = this.instances.add(requestKey);
//
//   this.storage.initItemIfNeed(requestKey);
//   this.storage.onChange(requestKey, cb);
//   // set state of start loading
//   this.storage.updateItem(requestKey, { loading: true });
//
//   // TODO: move to doGetRequest
//
//   // TODO: review type
//   let result: GetResponse<T>;
//
//   try {
//     result = await this.backend.get<T>(requestKey, props);
//   }
//   catch (e) {
//     // actually error shouldn't be real. Because request errors are in the result.
//     this.destroyRequest(requestKey);
//
//     throw e;
//   }
//
//   this.storage.updateItem(requestKey, {
//     loading: false,
//     loadedOnce: true,
//     // TODO: add errors
//     ...result,
//   });
//
//   // cb({
//   //   loadedOnce: true,
//   //   item: { id: 0, name: 'tttt' },
//   // } as any);
//   //
//   // setTimeout(() => {
//   //   cb({
//   //     item: { id: 0, name: 'yyyyyy' },
//   //   } as any);
//   // }, 5000)
// }

// /**
//  * Get the first result by query
//  */
// getFirst = async <T>(props: GetMethodProps, cb: (state: ItemState<T>) => void): string => {
//   // TODO: add
// }
