import {reactive} from '@vue/composition-api';

import Mold from '../../frontend/Mold';
import {
  BatchDeleteMethodProps,
  BatchPatchMethodProps,
  CreateMethodProps, DeleteMethodProps,
  FindMethodProps,
  GetMethodProps, PatchMethodProps, SaveMethodProps,
} from '../../frontend/interfaces/MethodsProps';
import {
  InstanceListState,
  InstanceItemState,
  InstanceActionState,
  instanceIdPropName
} from '../../frontend/interfaces/MethodsState';
import MoldFrontendProps from '../../frontend/interfaces/MoldFrontendProps';


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


  find = <T>(props: FindMethodProps): InstanceListState<T> => {
    const state: InstanceListState<T> = reactive({}) as any;
    const instanceId: string = this.mold.find<T>(
      props,
      (newState) => this.updateReactive(state, newState)
    );

    state[instanceIdPropName] = instanceId;

    return state;
  }

  get = <T>(props: GetMethodProps): InstanceItemState<T> => {
    const state: InstanceItemState<T> = reactive({}) as any;
    const instanceId: string = this.mold.get<T>(
      props,
      (newState) => this.updateReactive(state, newState)
    );

    state[instanceIdPropName] = instanceId;

    return state;
  }

  getFirst = <T>(props: GetMethodProps): InstanceItemState<T> => {
    const state: InstanceItemState<T> = reactive({}) as any;
    const instanceId: string = this.mold.getFirst<T>(
      props,
      (newState) => this.updateReactive(state, newState)
    );

    state[instanceIdPropName] = instanceId;

    return state;
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
  ): InstanceActionState<T> => {
    const state: InstanceActionState<T> = reactive({}) as any;
    const instanceId: string = this.mold.actonFetch<T>(
      actionName,
      actionProps,
      (newState) => this.updateReactive(state, newState)
    );

    state[instanceIdPropName] = instanceId;

    return state;
  }

  actonSave = (actionName: string, actionProps: {[index: string]: any}): Promise<void> => {
    return this.mold.actonSave(actionName, actionProps);
  }

  destroyInstance = (state: InstanceListState | InstanceItemState | InstanceActionState) => {
    this.mold.destroyRequest(state[instanceIdPropName]);
  }

  destroy = () => {
    this.mold.destroy();
  }


  private updateReactive(state: any, newState: any) {
    for (let key of Object.keys(newState)) {
      state[key] = newState[key];
    }
  }

}
