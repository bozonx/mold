import {onUnmounted, reactive, SetupContext} from '@vue/composition-api';
import {
  ActionState,
  InstanceActionState,
  ListResponse
} from '../../frontend/interfaces/MethodsState';
import {ActionProps, ActionPropsBase} from '../../frontend/interfaces/MethodsProps';
import Mold from '../../frontend/Mold';
import {instanceIdToRequestKey} from '../../helpers/common';
import {INSTANCE_ID_PROP_NAME} from '../../frontend/constants';


export default function moldFind<T>(
  context: SetupContext,
  actionProps: ActionPropsBase
): ActionState<ListResponse<T>> {
  // TODO: review
  // @ts-ignore
  const mold: Mold = context.root.$mold.mold;
  // init request but don't make a request it self
  const instanceId: string = mold.initRequest({
    action: 'find',
    isGetting: true,
    ...actionProps
  });
  const state: InstanceActionState<ListResponse<T>> = reactive({
    ...mold.getState(instanceId),
    [INSTANCE_ID_PROP_NAME]: instanceId,
  });
  // update reactive at any change
  mold.onChange(instanceId, (newState: ActionState) => {
    for (let key of Object.keys(newState)) state[key] = newState[key];
  });

  mold.start(instanceId);

  // TODO: start request

  onUnmounted(() => {
    mold.destroyInstance(state[INSTANCE_ID_PROP_NAME]);
  });

  return state;
}
