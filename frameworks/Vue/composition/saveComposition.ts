import {onUnmounted, reactive, SetupContext} from '@vue/composition-api';

import Mold from '../../../frontend/Mold';
import {ActionState, InstanceActionState} from '../../../frontend/interfaces/ActionState';
import {omitUndefined} from '../../../helpers/objects';
import {INSTANCE_ID_PROP_NAME} from '../../../frontend/constants';
import {CompositionProps} from '../../../frontend/interfaces/CompositionProps';


export interface SaveCompositionProps<T> extends ActionState<T> {
  save: (data: Record<string, any>) => void;
}

// TODO: review !!!!!!@@@!@! почему бы не выдавать просто стейт, ведь молд и так можно получить
interface SaveResult<T> {
  mold: Mold;
  instanceId: string;
  state: InstanceActionState<T>;
}


export function compositionSaveFunction(instanceId, data: Record<string, any>) {
  // @ts-ignore
  const mold: Mold = context.root.$mold;

  mold.start(instanceId, data);
}


export function saveComposition<T>(
  context: SetupContext,
  actionProps: CompositionProps,
  //stateExtend?: Record<string, any>
): SaveResult<T> {
  // @ts-ignore
  const mold: Mold = context.root.$mold;
  // init request
  const instanceId: string = mold.newRequest(actionProps);
  const state: InstanceActionState<T> = reactive(omitUndefined({
    ...mold.getState(instanceId),
    [INSTANCE_ID_PROP_NAME]: instanceId,
    //...stateExtend,
    // save: (stateAdditions)
    //   ? (data: Record<string, any>) => mold.start(instanceId, data)
    //   : undefined,
  })) as any;
  // update reactive at any change
  mold.onChange(instanceId, (newState: ActionState) => {
    for (let key of Object.keys(newState)) state[key] = newState[key];
  });

  onUnmounted(() => {
    mold.destroyInstance(instanceId);
  });

  return {
    mold,
    instanceId,
    state,
  }
}
