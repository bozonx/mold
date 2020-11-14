import Vue, {PluginObject} from 'vue';
import {reactive, UnwrapRef} from '@vue/composition-api';

import MoldFrontend from '../frontend/MoldFrontend';
import {
  CreateOrUpdateProps,
  CreateProps, DeleteProps,
  FindProps,
  GetFirstProps, GetItemProps,
  UpdateProps
} from '../frontend/interfaces/MethodsProps';
import {ItemsState, ItemState} from '../frontend/interfaces/MethodsState';


// TODO: насколько оптимальное копировать стейт в цикле? maybe use customRef ???


export class VueMoldFrontend {
  private onError: (msg: string) => void;
  private readonly mold: MoldFrontend;


  constructor(onError: (msg: string) => void) {
    this.onError = onError;
    this.mold = new MoldFrontend(onError);
  }


  find = <T>(props: FindProps): ItemsState<T> => {
    const state: UnwrapRef<ItemsState<T>> = reactive<ItemsState<T>>({
      loading: false,
      loadedOnce: false,
      lastErrors: null,
      count: -1,
      hasNext: false,
      hasPrev: false,
      items: null,
    });

    this.mold.find(props, (newState: ItemsState<T>) => {
      for (let key of Object.keys(newState)) {
        state[key] = newState[key];
      }
    }).catch(this.onError);

    return state as ItemsState<T>;
  }

  get = <T>(props: GetItemProps): ItemState<T> => {
    const state: UnwrapRef<ItemState<T>> = reactive<ItemState<T>>({
      loading: false,
      loadedOnce: false,
      lastErrors: null,
      item: null,
    });

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

  createOrUpdate = (props: CreateOrUpdateProps): Promise<void> => {
    return this.mold.createOrUpdate(props);
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

}


const VueMoldFrontendPlugin: PluginObject<void> = {
  install(vue: typeof Vue, options) {
    const mold = new VueMoldFrontend(
      // TODO: use from options too
      console.error
    );

    // @ts-ignore
    vue.$mold = mold;
    // @ts-ignore
    vue.prototype.$mold = mold;
  },
};

export default VueMoldFrontendPlugin;
