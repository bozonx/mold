import {
  BatchDeleteMethodProps,
  BatchPatchMethodProps,
  CreateMethodProps, DeleteMethodProps,
  FindMethodProps,
  GetMethodProps, PatchMethodProps, SaveMethodProps,
} from './interfaces/MethodsProps';
import {ListState, ItemState, FindResponse, GetResponse} from './interfaces/MethodsState';
import StorageManager from './StorageManager';
import BackendManager from './BackendManager';
import {makeRequestKey} from '../helpers/common';
import PushesManager from './PushesManager';
import MoldFrontendProps from './interfaces/MoldFrontendProps';
import {RequestKey} from './interfaces/RequestKey';


export default class Mold {
  readonly props: MoldFrontendProps;
  readonly backend: BackendManager;
  readonly push: PushesManager;
  readonly storage: StorageManager;


  constructor(props: Partial<MoldFrontendProps>) {
    this.props = this.prepareProps(props);
    this.backend = new BackendManager(this);
    this.push = new PushesManager(this);
    this.storage = new StorageManager();
  }


  /**
   * Find several records
   * cb will be called on any state change - start loading, finish, error and data change.
   */
  find = async <T>(props: FindMethodProps, cb: (state: ListState<T>) => void): Promise<void> => {
    const requestKey: RequestKey = makeRequestKey('find', props);

    this.storage.initListIfNeed(requestKey);
    this.storage.onChange(requestKey, cb);
    // set state of start loading
    this.storage.updateList(requestKey, { loading: true });

    let result: FindResponse<T>;

    try {
      result = await this.backend.find<T>(requestKey, props);
    }
    catch (e) {
      // TODO: если это новый реквест то можно задестроить,
      //  если нет то наверное добавить ошибку в стейт
      // actually error shouldn't be real. Because request errors are in the result.
      //this.destroyRequest(requestKey);

      throw e;
    }

    this.storage.updateList(requestKey, {
      loading: false,
      loadedOnce: true,
      // TODO: add errors
      ...result,
    });
  }

  /**
   * Get certain record by id
   */
  get = async <T>(props: GetMethodProps, cb: (state: ItemState<T>) => void): Promise<void> => {
    const requestKey: RequestKey = makeRequestKey('get', props);

    this.storage.initItemIfNeed(requestKey);
    this.storage.onChange(requestKey, cb);
    // set state of start loading
    this.storage.updateItem(requestKey, { loading: true });

    let result: GetResponse<T>;

    try {
      result = this.backend.get<T>(requestKey, props);
    }
    catch (e) {
      // actually error shouldn't be real. Because request errors are in the result.
      this.destroyRequest(requestKey);

      throw e;
    }

    this.storage.updateItem(requestKey, {
      loading: false,
      loadedOnce: true,
      // TODO: add errors
      ...result,
    });

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

  /**
   * Get the first result by query
   */
  getFirst = async <T>(props: GetMethodProps, cb: (state: ItemState<T>) => void): Promise<void> => {
    // TODO: add
  }

  create = async (props: CreateMethodProps): Promise<void> => {
    // TODO: add
  }

  patch = async (props: PatchMethodProps): Promise<void> => {
    // TODO: add
  }

  /**
   * Create or update
   */
  save = async (props: SaveMethodProps): Promise<void> => {
    // TODO: add
  }

  delete = async (props: DeleteMethodProps): Promise<void> => {
    // TODO: add
  }

  batchPatch = async (props: BatchPatchMethodProps): Promise<void> => {
    // TODO: add
  }

  batchDelete = async (props: BatchDeleteMethodProps): Promise<void> => {
    // TODO: add
  }

  /**
   * Call some action at a backend and return its state
   */
  actonFetch = async (actionName: string, actionProps: {[index: string]: any}): Promise<void> => {
    // TODO: add
    // TODO: должно вернуть стейт
  }

  /**
   * Save some data to backend. It doesn't return any state.
   */
  actonSave = async (actionName: string, actionProps: {[index: string]: any}): Promise<void> => {
    // TODO: add
  }

  destroyRequest = (requestKey: RequestKey) => {
    this.storage.destroyRequest(requestKey);

    // TODO: add call push, request
  }

  destroy = () => {
    // TODO: add
  }


  private prepareProps(props: Partial<MoldFrontendProps>): MoldFrontendProps {
    // TODO: check props and merge with defaults
  }

}
