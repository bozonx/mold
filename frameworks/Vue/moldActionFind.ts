import {SetupContext} from '@vue/composition-api';

import {findComposition, FindCompositionState} from './composition/findComposition';
import {FindCompositionProps} from './composition/retrieveComposition';


export default function moldActionFind<T>(
  context: SetupContext,
  actionName: string,
  actionProps: FindCompositionProps
): FindCompositionState<T> {
  const {state} = findComposition<T>(context, actionName, actionProps);

  return state;
}
