import {reactive, UnwrapRef} from '@vue/composition-api';

import MoldFrontend from '../frontend/MoldFrontend';
import {
  CreateOrUpdateProps,
  CreateProps,
  DeleteProps,
  FindMethodProps,
  GetMethodProps,
  UpdateProps
} from '../frontend/interfaces/MethodsProps';
import {ListState, ItemState, makeItemsInitialState} from '../frontend/interfaces/MethodsState';
import MoldFrontendProps from '../frontend/interfaces/MoldFrontendProps';


/**
 * Wrapper of mold frontend for Vue composition api.
 */
export default class VueMoldFrontend {
  private props: Partial<MoldFrontendProps>;
  private readonly mold: MoldFrontend;


  constructor(props: Partial<MoldFrontendProps>) {
    this.props = props;
    this.mold = new MoldFrontend(props);
  }


  find = <T>(props: FindMethodProps): ListState<T> => {
    const state: UnwrapRef<ListState<T>> = reactive<ListState<T>>({
      // TODO: как его установить ???
      $requestId: null,
      ...makeItemsInitialState(),
    } as any);

    // TODO: $requestId наверное можно установить во вне через state.$requestId

    // TODO: может он вовращает { stateId, promise }
    this.mold.find(props, (newState: ListState<T>) => {
      for (let key of Object.keys(newState)) {
        state[key] = newState[key];
      }
    }).catch(this.props.logger.error);

    return state as ListState<T>;
  }

  get = <T>(props: GetMethodProps): ItemState<T> => {
    const state: UnwrapRef<ItemState<T>> = reactive<ItemState<T>>({
      // TODO: как его установить ???
      $requestId: null,

      loading: false,
      loadedOnce: false,
      lastErrors: null,
      item: null,
    } as any);

    this.mold.get(props, (newState: ItemState<T>) => {
      for (let key of Object.keys(newState)) {
        state[key] = newState[key];
      }
    }).catch(this.props.logger.error);

    return state as ItemState<T>;
  }

  getFirst = <T>(props: GetMethodProps): ItemState<T> => {
    const state: UnwrapRef<ItemState<T>> = reactive<ItemState<T>>({
      loading: false,
      loadedOnce: false,
      lastErrors: null,
      item: null,
    });

    this.mold.getFirst(props, (newState: ItemState<T>) => {
      for (let key of Object.keys(newState)) {
        state[key] = newState[key];
      }
    }).catch(this.onError);

    return state as ItemState<T>;
  }

  create = (props: CreateProps): Promise<void> => {
    return this.mold.create(props);
  }

  patch = (props: UpdateProps): Promise<void> => {
    return this.mold.patch(props);
  }

  save = (props: CreateOrUpdateProps): Promise<void> => {
    return this.mold.save(props);
  }

  delete = (props: DeleteProps): Promise<void> => {
    return this.mold.delete(props);
  }

  // TODO: add
  batchPatch = (): Promise<void> => {
    return this.mold.batchPatch();
  }

  // TODO: add
  batchDelete = (): Promise<void> => {
    return this.mold.batchDelete();
  }

  acton = (actionName: string, actionProps: {[index: string]: any}): Promise<void> => {
    return this.mold.acton(actionName, actionProps);
  }

  destroyState = (state: ListState | ItemState) => {
    this.mold.destroyState((state as any).$requestId);
  }

  destroy = () => {
    this.mold.destroy();
  }

}
