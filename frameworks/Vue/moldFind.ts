import {SetupContext} from '@vue/composition-api';
import {findComposition, FindCompositionState} from './composition/findComposition';
import {RetrieveCompositionProps} from './composition/retrieveComposition';


export default function moldFind<T>(
  context: SetupContext,
  actionProps: RetrieveCompositionProps
): FindCompositionState<T> {
  const {state} = findComposition<T>(context, 'find', actionProps);

  return state;
}
