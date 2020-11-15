import {ListState} from '../../frontend/interfaces/MethodsState';
import {onUnmounted, SetupContext} from '@vue/composition-api';
import VueMold from './VueMold';
import {FindMethodProps} from '../../frontend/interfaces/MethodsProps';


export default function moldList<T>(
  context: SetupContext,
  methodProps: FindMethodProps
): ListState<T> {
  // @ts-ignore
  const mold: VueMold = context.root.$mold;

  const state = mold.find<T>(methodProps);

  onUnmounted(() => {
    mold.destroyInstance(state);
  });

  return state;
}
