import {onUnmounted, reactive, SetupContext} from '@vue/composition-api';

import Mold from '../../../frontend/Mold';
import {ActionState} from '../../../frontend/interfaces/ActionState';
import {omitUndefined} from '../../../helpers/objects';
import {INSTANCE_ID_PROP_NAME} from '../../../frontend/constants';
import {CompositionProps} from '../../../frontend/interfaces/CompositionProps';
import {ActionProps} from '../../../frontend/interfaces/ActionProps';


export interface MoldCompositionResult<T> {
  mold: Mold;
  instanceId: string;
  state: ActionState<T>;
}


export function moldComposition<T>(
  context: SetupContext,
  actionProps: ActionProps,
  onChangeCbOverride?: (newState: ActionState<T>) => ActionState
): MoldCompositionResult<T> {
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
    const completeState: ActionState | T = (onChangeCbOverride)
      ? onChangeCbOverride(newState)
      : newState;

    // TODO: use Object.assign(state, newState);
    for (let key of Object.keys(completeState)) state[key] = completeState[key];
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
