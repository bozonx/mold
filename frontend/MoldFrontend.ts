import {
  CreateOrUpdateProps,
  CreateProps, DeleteProps,
  FindProps,
  GetFirstProps,
  GetItemProps,
  UpdateProps
} from './interfaces/MethodsProps';
import {ListState, ItemState, makeItemsInitialState, FindResult} from './interfaces/MethodsState';
import StateStorage from './StateStorage';
import BackendManager from './BackendManager';
import {makeRequestId} from '../helpers/common';
import UpdateManager from './UpdateManager';
import MoldFrontendProps from './interfaces/MoldFrontendProps';


export default class MoldFrontend {
  private onError: (msg: string) => void;
  private readonly backend: BackendManager;
  private readonly push: UpdateManager;
  private readonly storage: StateStorage;


  constructor(props: MoldFrontendProps) {
    this.onError = onError;
    this.backend = new BackendManager();
    this.push = new UpdateManager();
    this.storage = new StateStorage();
  }


  /**
   * Find several records
   * cb will be called on any state change - start loading, finish, error and data change.
   */
  find = async <T>(props: FindProps, cb: (state: ListState<T>) => void): Promise<void> => {
    const stateId: string = makeRequestId(props);

    this.storage.setupList(stateId, props, makeItemsInitialState());

    // TODO: как потом удалить обработчики???
    this.storage.onChange(stateId, cb);
    // set state of start loading
    this.storage.update(stateId, { loading: true });

    let result: FindResult<T>;

    try {
      result = this.backend.find<T>(stateId, props);
    }
    catch (e) {
      // TODO: set error to storage

      this.storage.update(stateId, {
        loading: false,
        loadedOnce: true,
      });

      return;
    }

    this.storage.update(stateId, {
      loading: true,
      loadedOnce: true,
      ...result,
    });
  }

  /**
   * Get certain record by id
   */
  get = async <T>(props: GetItemProps, cb: (state: ItemState<T>) => void): Promise<void> => {
    // cb({
    //   loadedOnce: true,
    //   item: { id: 0, name: 'tttt' },
    // } as any);
    //
    // setTimeout(() => {
    //   cb({
    //     item: { id: 0, name: 'yyyyyy' },
    //   } as any);
    // }, 5000)
  }

  // /**
  //  * Get the first result by query
  //  */
  // getFirst = async <T>(props: GetFirstProps, cb: (state: ItemState<T>) => void): Promise<void> => {
  //   // TODO: add
  // }

  create = async (props: CreateProps): Promise<void> => {
    // TODO: add
  }

  patch = async (props: UpdateProps): Promise<void> => {
    // TODO: add
  }

  /**
   * Create or update
   */
  save = async (props: CreateOrUpdateProps): Promise<void> => {
    // TODO: add
  }

  delete = async (props: DeleteProps): Promise<void> => {
    // TODO: add
  }

  // TODO: add
  batchPatch = async (): Promise<void> => {
    // TODO: add
  }

  // TODO: add
  batchDelete = async (): Promise<void> => {
    // TODO: add
  }

  // TODO: add
  /**
   * Call some action at backend
   */
  acton = async (actionName: string, actionProps: {[index: string]: any}): Promise<void> => {
    // TODO: add
  }

  destroyState = (stateId: string) => {
    // TODO: add call storage, push, request
  }

  destroy = () => {
    // TODO: add
  }

}
