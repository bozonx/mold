import {onUnmounted, reactive, SetupContext} from '@vue/composition-api';
import {HighLevelProps} from '../../frontend/interfaces/MethodsProps';
import {ActionState, InstanceActionState, ItemResponse} from '../../frontend/interfaces/MethodsState';
import Mold from '../../frontend/Mold';
import {omitObj} from '../../helpers/objects';
import {INSTANCE_ID_PROP_NAME} from '../../frontend/constants';


interface RetrieveResult<T> {
  mold: Mold;
  instanceId: string;
  state: InstanceActionState<T> & {load: () => void};
}


export function retrieveComposition<T>(
  context: SetupContext,
  actionName: string,
  actionProps: HighLevelProps & { dontLoadImmediately: boolean }
): RetrieveResult<T> {
  // @ts-ignore
  const mold: Mold = context.root.$mold;
  // init request
  const instanceId: string = mold.newRequest({
    action: actionName,
    isGetting: true,
    ...omitObj(actionProps, 'dontLoadImmediately') as HighLevelProps,
  });
  const state: InstanceActionState<T> & {load: () => void} = reactive({
    ...mold.getState(instanceId),
    [INSTANCE_ID_PROP_NAME]: instanceId,
    load: () => mold.start(instanceId),
  }) as any;
  // update reactive at any change
  mold.onChange(instanceId, (newState: ActionState) => {
    for (let key of Object.keys(newState)) state[key] = newState[key];
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


export default function moldActionGet<T>(
  context: SetupContext,
  actionName: string,
  actionProps: HighLevelProps & { dontLoadImmediately: boolean }
): InstanceActionState<ItemResponse<T>> & {load: () => void} {
  const {state} = retrieveComposition<ItemResponse<T>>(context, actionName, actionProps);

  return state;
}
