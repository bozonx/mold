import {reactive, onUnmounted, inject} from 'vue'
import Mold from '../../../frontend/Mold'
import {ActionState} from '../../../frontend/interfaces/ActionState'
import {omitUndefined} from '../../../helpers/objects'
import {INSTANCE_ID_PROP_NAME} from '../../../frontend/constants'
import {ActionProps} from '../../../frontend/interfaces/ActionProps'
import {VUE_CONTEXT_NAME} from '../constants'


export interface MoldCompositionResult<T> {
  mold: Mold
  instanceId: string
  state: ActionState<T>
}

export interface InstanceState {
  // string like "backend|set|action|request|instanceNum"
  __instanceId: string;
}


export function moldComposition<T>(
  actionProps: ActionProps,
  onChangeCbOverride?: (newState: ActionState<T>) => ActionState
): MoldCompositionResult<T> {
  const mold = inject<Mold>(VUE_CONTEXT_NAME)

  if (!mold) throw new Error(`Can't get mold from app context`)

  // init request
  const instanceId: string = mold.newRequest(actionProps);
  const state: ActionState<T> = reactive(omitUndefined({
    ...mold.getState(instanceId),
    [INSTANCE_ID_PROP_NAME]: instanceId,
  })) as any
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
