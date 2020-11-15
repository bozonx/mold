import {reactive, UnwrapRef} from '@vue/composition-api';

import MoldFrontend from '../frontend/MoldFrontend';
import {
  CreateOrUpdateProps,
  CreateProps,
  DeleteProps,
  FindProps,
  GetFirstProps,
  GetItemProps,
  UpdateProps
} from '../frontend/interfaces/MethodsProps';
import {ListState, ItemState, makeItemsInitialState} from '../frontend/interfaces/MethodsState';
import FrontendProps from '../frontend/interfaces/FrontendProps';


export default class VueMoldFrontend {
  private props: FrontendProps;
  private readonly mold: MoldFrontend;


  constructor(props: FrontendProps) {
    this.props = props;
    // TODO: review props to send
    this.mold = new MoldFrontend(props.logger.error);
  }


  find = <T>(props: FindProps): ListState<T> => {
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
    }).catch(this.onError);

    return state as ListState<T>;
  }

  get = <T>(props: GetItemProps): ItemState<T> => {
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
    }).catch(this.onError);

    return state as ItemState<T>;
  }

  getFirst = <T>(props: GetFirstProps): ItemState<T> => {
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

  update = (props: UpdateProps): Promise<void> => {
    return this.mold.update(props);
  }

  save = (props: CreateOrUpdateProps): Promise<void> => {
    return this.mold.save(props);
  }


  deleteItem = (props: DeleteProps): Promise<void> => {
    return this.mold.deleteItem(props);
  }

  // TODO: add
  butchUpdate = (): Promise<void> => {
    return this.mold.butchUpdate();
  }

  // TODO: add
  butchDelete = (): Promise<void> => {
    return this.mold.butchDelete();
  }

  // TODO: add
  /**
   * Call some action at backend
   */
  acton = (): Promise<void> => {
    return this.mold.acton();
  }

  destroyState = (state: ListState | ItemState) => {
    this.mold.destroyState((state as any).$requestId);
  }

  destroy = () => {
    this.mold.destroy();
  }

}
