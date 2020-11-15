import {ItemState} from '../../frontend/interfaces/MethodsState';
import {onUnmounted, SetupContext} from '@vue/composition-api';
import VueMold from './VueMold';
import {GetMethodProps} from '../../frontend/interfaces/MethodsProps';


export default function moldItem<T>(
  context: SetupContext,
  methodProps: GetMethodProps
): ItemState<T> {
  // @ts-ignore
  const mold: VueMold = context.root.$mold;

  // TODO: add getFirst

  const state = mold.get<T>(methodProps);

  onUnmounted(() => {
    mold.destroyInstance(state);
  });

  return state;
}
