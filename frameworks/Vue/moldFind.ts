import {onUnmounted, reactive, SetupContext} from '@vue/composition-api';
import {
  ActionState,
  InstanceActionState,
  ListResponse
} from '../../frontend/interfaces/MethodsState';
import {HighLevelProps} from '../../frontend/interfaces/MethodsProps';
import Mold from '../../frontend/Mold';
import {INSTANCE_ID_PROP_NAME} from '../../frontend/constants';
import {omitObj} from '../../helpers/objects';


type State<T> = InstanceActionState<ListResponse<T>> & {load: () => void};


export default function moldFind<T>(
  context: SetupContext,
  actionProps: HighLevelProps & { dontLoadImmediately: boolean }
): State<T> {
  // @ts-ignore
  const mold: Mold = context.root.$mold;
  // init request
  const instanceId: string = mold.newRequest({
    action: 'find',
    isGetting: true,
    ...omitObj(actionProps, 'dontLoadImmediately') as HighLevelProps,
  });
  const state: State<T> = reactive({
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

  return state;
}
