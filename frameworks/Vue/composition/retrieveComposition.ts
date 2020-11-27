import {onUnmounted, reactive, SetupContext} from '@vue/composition-api';

import {omitObj} from '../../../helpers/objects';
import Mold from '../../../frontend/Mold';
import {ActionState, InstanceState} from '../../../frontend/interfaces/ActionState';
import {INSTANCE_ID_PROP_NAME} from '../../../frontend/constants';
import {CompositionProps} from '../../../frontend/interfaces/CompositionProps';


export interface RetrieveAdditionalState {
  load: () => void;
}

export interface RetrieveResult<T> {
  mold: Mold;
  instanceId: string;
  state: T & InstanceState & RetrieveAdditionalState;
}

export interface RetrieveCompositionProps extends CompositionProps {
  dontLoadImmediately?: boolean
}


export function retrieveComposition<T>(
  context: SetupContext,
  actionName: string,
  actionProps: RetrieveCompositionProps,
  changeTransform?: (newState: ActionState) => T
): RetrieveResult<T> {
  // @ts-ignore
  const mold: Mold = context.root.$mold;
  // init request
  const instanceId: string = mold.newRequest({
    action: actionName,
    isGetting: true,
    ...omitObj(actionProps, 'dontLoadImmediately') as HighLevelProps,
  });

  const state: T & InstanceState & RetrieveAdditionalState = reactive({
    ...mold.getState(instanceId),
    [INSTANCE_ID_PROP_NAME]: instanceId,
    load: () => mold.start(instanceId),
  }) as any;

  // update reactive at any change
  mold.onChange(instanceId, (newState: ActionState) => {
    const completeState: ActionState | T = (changeTransform)
      ? changeTransform(newState)
      : newState

    // TODO: use Object.assign(state, newState);
    for (let key of Object.keys(completeState)) state[key] = completeState[key];
  });

  if (!actionProps.dontLoadImmediately) {
    // start request immediately
    mold.start(instanceId);
  }

  onUnmounted(() => {
    mold.destroyInstance(state[INSTANCE_ID_PROP_NAME]);
  });

  return {
    mold,
    instanceId,
    state,
  }
}
