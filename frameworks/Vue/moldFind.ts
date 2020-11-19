import {SetupContext} from '@vue/composition-api';
import {findComposition, FindCompositionState} from './composition/findComposition';
import {FindCompositionProps} from './composition/retrieveComposition';


export default function moldFind<T>(
  context: SetupContext,
  actionProps: FindCompositionProps
): FindCompositionState<T> {
  const {state} = findComposition<T>(context, 'find', actionProps);

  return state;
}
