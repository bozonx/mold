import {onUnmounted, reactive, SetupContext} from '@vue/composition-api';

import Mold from '../../../frontend/Mold';
import {ActionState} from '../../../frontend/interfaces/ActionState';
import {omitUndefined} from '../../../helpers/objects';
import {INSTANCE_ID_PROP_NAME} from '../../../frontend/constants';
import {CompositionProps} from '../../../frontend/interfaces/CompositionProps';


interface SaveResult<T> {
  mold: Mold;
  instanceId: string;
  state: ActionState<T>;
}


export function saveComposition<T>(
  context: SetupContext,
  actionProps: CompositionProps,
): SaveResult<T> {
  // @ts-ignore
  const mold: Mold = context.root.$mold;
  // init request
  const instanceId: string = mold.newRequest(actionProps);
  const state: ActionState<T> = reactive(omitUndefined({
    ...mold.getState(instanceId),
    [INSTANCE_ID_PROP_NAME]: instanceId,
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
