import Vue, {PluginObject} from 'vue';
import {reactive, UnwrapRef} from '@vue/composition-api';

import MoldFrontend from '../frontend/MoldFrontend';
import {FindProps} from '../frontend/interfaces/MethodsProps';
import {ItemsState} from '../frontend/interfaces/MethodsResults';


export class VueMoldFrontend {
  private onError: (msg: string) => void;
  private readonly mold: MoldFrontend;


  constructor(onError: (msg: string) => void) {
    this.onError = onError;
    this.mold = new MoldFrontend(onError);
  }


  find = <T>(
    props: FindProps,
  ): ItemsState<T> => {
    const state: UnwrapRef<ItemsState<T>> = reactive<ItemsState<T>>({
      loading: false,
      loadedOnce: false,
      count: -1,
      hasNext: false,
      hasPrev: false,
      items: null,
      // errors of last request
      lastErrors: null,
    });

    this.mold.find(props, (newState: ItemsState<T>) => {
      for (let key of Object.keys(newState)) {
        // TODO: насколько это оптимальное, maybe use customRef ???
        state[key] = newState[key];
      }
    }).catch(this.onError);

    return state as ItemsState<T>;
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
