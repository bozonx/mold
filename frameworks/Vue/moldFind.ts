import {onUnmounted, reactive, SetupContext} from '@vue/composition-api';
import {
  ActionState,
  InstanceActionState,
  ListResponse
} from '../../frontend/interfaces/MethodsState';
import {ActionPropsBase} from '../../frontend/interfaces/MethodsProps';
import Mold from '../../frontend/Mold';
import {INSTANCE_ID_PROP_NAME} from '../../frontend/constants';


export default function moldFind<T>(
  context: SetupContext,
  actionProps: ActionPropsBase
): ActionState<ListResponse<T>> {
  // @ts-ignore
  const mold: Mold = context.root.$mold;
  // init request but don't make a request it self
  const instanceId: string = mold.initRequest({
    action: 'find',
    isGetting: true,
    ...actionProps
  });
  const state: InstanceActionState<ListResponse<T>> = reactive({
    ...mold.getState(instanceId),
    [INSTANCE_ID_PROP_NAME]: instanceId,
  }) as any;
  // update reactive at any change
  mold.onChange(instanceId, (newState: ActionState) => {
    for (let key of Object.keys(newState)) state[key] = newState[key];
  });
  // start request immediately
  mold.start(instanceId);

  onUnmounted(() => {
    mold.destroyInstance(state[INSTANCE_ID_PROP_NAME]);
  });

  return state;
}
