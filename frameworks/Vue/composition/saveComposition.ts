import Mold from '../../../frontend/Mold';
import {ActionState, InstanceActionState} from '../../../frontend/interfaces/MethodsState';
import {onUnmounted, reactive, SetupContext} from '@vue/composition-api';
import {HighLevelProps} from '../../../frontend/interfaces/MethodsProps';
import {omitObj} from '../../../helpers/objects';
import {INSTANCE_ID_PROP_NAME} from '../../../frontend/constants';


export interface SaveCompositionAdditionalProps {
  save: (data: Record<string, any>) => void;
}

interface SaveResult<T> {
  mold: Mold;
  instanceId: string;
  state: InstanceActionState<T> & SaveCompositionAdditionalProps;
}


export function saveComposition<T>(
  context: SetupContext,
  // use undefined for save purpose where only at save method calling
  // is clear which action to use: create or update
  actionName: string,
  actionProps: HighLevelProps
): SaveResult<T> {
  // @ts-ignore
  const mold: Mold = context.root.$mold;
  // init request
  const instanceId: string = mold.newRequest({
    action: actionName,
    ...actionProps,
  });
  const state: InstanceActionState<T> & SaveCompositionAdditionalProps = reactive({
    ...mold.getState(instanceId),
    [INSTANCE_ID_PROP_NAME]: instanceId,
    save: (data: Record<string, any>) => mold.start(instanceId, data),
  }) as any;
  // update reactive at any change
  mold.onChange(instanceId, (newState: ActionState) => {
    for (let key of Object.keys(newState)) state[key] = newState[key];
  });

  onUnmounted(() => {
    mold.destroyInstance(state[INSTANCE_ID_PROP_NAME]);
  });

  return {
    mold,
    instanceId,
    state,
  }
}
