import {reactive, UnwrapRef} from '@vue/composition-api';

import Mold from '../../frontend/Mold';
import {
  BatchDeleteMethodProps,
  BatchPatchMethodProps,
  CreateMethodProps, DeleteMethodProps,
  FindMethodProps,
  GetMethodProps, PatchMethodProps, SaveMethodProps,
} from '../../frontend/interfaces/MethodsProps';
import {ListState, ItemState, ActionState} from '../../frontend/interfaces/MethodsState';
import MoldFrontendProps from '../../frontend/interfaces/MoldFrontendProps';


// TODO: надо самим задать Vue.$mold в плагине


/**
 * Wrapper of mold frontend for Vue composition api.
 */
export default class VueMold {
  private props: Partial<MoldFrontendProps>;
  private readonly mold: Mold;


  constructor(props: Partial<MoldFrontendProps>) {
    this.props = props;
    this.mold = new Mold(props);
  }


  find = <T>(props: FindMethodProps): ListState<T> => {
    const state: UnwrapRef<ListState<T>> = reactive<ListState<T>>({} as any);
    const instanceId: string = this.mold.find<T>(props, (newState: ListState<T>) => {
      for (let key of Object.keys(newState)) {
        state[key] = newState[key];
      }
    });

    state.__instanceId = instanceId;

    return state as ListState<T>;
  }

  get = <T>(props: GetMethodProps): ItemState<T> => {
    const state: UnwrapRef<ItemState<T>> = reactive<ItemState<T>>({} as any);
    const instanceId: string = this.mold.get<T>(props, (newState: ItemState<T>) => {
      for (let key of Object.keys(newState)) {
        state[key] = newState[key];
      }
    });

    state.__instanceId = instanceId;

    return state as ItemState<T>;
  }

  getFirst = <T>(props: GetMethodProps): ItemState<T> => {
    const state: UnwrapRef<ItemState<T>> = reactive<ItemState<T>>({} as any);
    const instanceId: string = this.mold.getFirst<T>(props, (newState: ItemState<T>) => {
      for (let key of Object.keys(newState)) {
        state[key] = newState[key];
      }
    });

    state.__instanceId = instanceId;

    return state as ItemState<T>;
  }

  create = (props: CreateMethodProps): Promise<void> => {
    return this.mold.create(props);
  }

  patch = (props: PatchMethodProps): Promise<void> => {
    return this.mold.patch(props);
  }

  save = (props: SaveMethodProps): Promise<void> => {
    return this.mold.save(props);
  }

  delete = (props: DeleteMethodProps): Promise<void> => {
    return this.mold.delete(props);
  }

  batchPatch = (props: BatchPatchMethodProps): Promise<void> => {
    return this.mold.batchPatch(props);
  }

  batchDelete = (props: BatchDeleteMethodProps): Promise<void> => {
    return this.mold.batchDelete(props);
  }

  actonFetch = <T>(
    actionName: string,
    actionProps: {[index: string]: any}
  ): ActionState<T> => {
    const state: UnwrapRef<ActionState<T>> = reactive<ActionState<T>>({} as any);
    const instanceId: string = this.mold.actonFetch<T>(
      actionName,
      actionProps,
      (newState: ActionState<T>) => {
        for (let key of Object.keys(newState)) {
          state[key] = newState[key];
        }
      }
    );

    state.__instanceId = instanceId;

    return state as ActionState<T>;
  }

  actonSave = (actionName: string, actionProps: {[index: string]: any}): Promise<void> => {
    return this.mold.actonSave(actionName, actionProps);
  }

  destroyInstance = (state: ListState | ItemState) => {
    // TODO: review $requestId
    this.mold.destroyRequest((state as any).$requestId);
  }

  destroy = () => {
    this.mold.destroy();
  }

}
