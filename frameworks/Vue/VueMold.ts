import {reactive} from '@vue/composition-api';

import Mold from '../../frontend/Mold';
import {
  ActionProps,
  BatchDeleteMethodProps,
  BatchPatchMethodProps,
  CreateMethodProps,
  DeleteMethodProps,
  PatchMethodProps,
  SaveMethodProps,
} from '../../frontend/interfaces/MethodsProps';
import {
  InstanceActionState,
  instanceIdPropName
} from '../../frontend/interfaces/MethodsState';
import MoldFrontendProps from '../../frontend/interfaces/MoldFrontendProps';
import {instanceIdToRequestKey} from '../../helpers/common';


/**
 * Wrapper of mold frontend for Vue composition api.
 */
export default class VueMold {
  private props: Partial<MoldFrontendProps>;
  readonly mold: Mold;


  constructor(props: Partial<MoldFrontendProps>) {
    this.props = props;
    this.mold = new Mold(props);
  }

  // TODO: добавить тип для list
  find = <T>(props: ActionProps): InstanceActionState<T> => {
    return this.actionFetch('find', props);
  }

  // TODO: добавить тип для item
  get = <T>(props: ActionProps): InstanceActionState<T> => {
    return this.actionFetch('get', props);
  }

  // TODO: добавить тип для item
  getFirst = <T>(props: ActionProps): InstanceActionState<T> => {

    return this.actionFetch('getFirst', props);
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

  actionFetch = <T>(
    actionName: string,
    actionProps: ActionProps
  ): InstanceActionState<T> => {
    const instanceId: string = this.mold.fetch<T>(
      actionName,
      actionProps,
      (newState) => this.updateReactive(state, newState)
    );
    const storageState = this.mold.storage.getState(instanceIdToRequestKey(instanceId));

    if (!storageState) {
      throw new Error(`No state`);
    }

    const state: InstanceActionState<T> = reactive(storageState) as any;

    state[instanceIdPropName] = instanceId;

    return state;
  }

  actonSave = (actionName: string, actionProps: {[index: string]: any}): Promise<void> => {
    return this.mold.actonSave(actionName, actionProps);
  }

  destroyInstance = (state: InstanceActionState) => {
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
