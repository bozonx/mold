import {onUnmounted, SetupContext} from '@vue/composition-api';
import VueMold from './VueMold';
import {ActionState, ListResponse} from '../../frontend/interfaces/MethodsState';
import {ActionProps} from '../../frontend/interfaces/MethodsProps';


export default function moldFind<T>(
  context: SetupContext,
  methodProps: ActionProps
): ActionState<ListResponse<T>> {
  // @ts-ignore
  const mold: VueMold = context.root.$mold;

  // TODO: set action name
  // TODO: set isGetting
  const state = mold.find<T>(methodProps);

  onUnmounted(() => {
    mold.destroyInstance(state);
  });

  return state;
}
