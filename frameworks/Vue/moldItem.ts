import {onUnmounted, SetupContext} from '@vue/composition-api';
import VueMold from './VueMold';
import {ActionProps} from '../../frontend/interfaces/MethodsProps';
import {ActionState} from '../../frontend/interfaces/MethodsState';


// TODO: задать специфический тип для item

export default function moldItem<T>(
  context: SetupContext,
  methodProps: ActionProps
): ActionState<T> {
  // @ts-ignore
  const mold: VueMold = context.root.$mold;

  // TODO: add getFirst

  const state = mold.get<T>(methodProps);

  onUnmounted(() => {
    mold.destroyInstance(state);
  });

  return state;
}
