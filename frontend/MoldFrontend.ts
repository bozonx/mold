import {
  BatchDeleteMethodProps,
  BatchPatchMethodProps,
  CreateMethodProps, DeleteMethodProps,
  FindMethodProps,
  GetMethodProps, PatchMethodProps, SaveMethodProps,
} from './interfaces/MethodsProps';
import {ListState, ItemState, makeItemsInitialState, FindResult} from './interfaces/MethodsState';
import StateStorage from './StateStorage';
import BackendManager from './BackendManager';
import {makeRequestId} from '../helpers/common';
import PushesManager from './PushesManager';
import MoldFrontendProps from './interfaces/MoldFrontendProps';
import {RequestKey} from './interfaces/RequestKey';


export default class MoldFrontend {
  private readonly props: MoldFrontendProps;
  private readonly backend: BackendManager;
  private readonly push: PushesManager;
  private readonly storage: StateStorage;


  constructor(props: Partial<MoldFrontendProps>) {
    this.props = this.prepareProps(props);
    this.backend = new BackendManager();
    this.push = new PushesManager();
    this.storage = new StateStorage();
  }


  /**
   * Find several records
   * cb will be called on any state change - start loading, finish, error and data change.
   */
  find = async <T>(props: FindMethodProps, cb: (state: ListState<T>) => void): Promise<void> => {
    const requestKey: RequestKey = makeRequestId(props);
    // init list if need
    this.storage.initList(stateId, props, makeItemsInitialState());

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
  get = async <T>(props: GetMethodProps, cb: (state: ItemState<T>) => void): Promise<void> => {
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

  destroyState = (stateId: string) => {
    // TODO: add call storage, push, request
  }

  destroy = () => {
    // TODO: add
  }


  private prepareProps(props: Partial<MoldFrontendProps>): MoldFrontendProps {
    // TODO: check props and merge with defaults
  }

}
