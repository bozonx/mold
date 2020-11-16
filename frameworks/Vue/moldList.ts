import {onUnmounted, SetupContext} from '@vue/composition-api';
import VueMold from './VueMold';
import {ActionState} from '../../frontend/interfaces/MethodsState';
import {ActionProps} from '../../frontend/interfaces/MethodsProps';


// TODO: задать специфический тип для списка

export default function moldList<T>(
  context: SetupContext,
  methodProps: ActionProps
): ActionState<T> {
  // @ts-ignore
  const mold: VueMold = context.root.$mold;

  const state = mold.find<T>(methodProps);

  onUnmounted(() => {
    mold.destroyInstance(state);
  });

  return state;
}
