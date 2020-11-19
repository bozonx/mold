import {SetupContext} from '@vue/composition-api';

import {findComposition, FindCompositionState} from './composition/findComposition';
import {RetrieveCompositionProps} from './composition/retrieveComposition';


export default function moldActionFind<T>(
  context: SetupContext,
  actionName: string,
  actionProps: RetrieveCompositionProps
): FindCompositionState<T> {
  const {state} = findComposition<T>(context, actionName, actionProps);

  return state;
}
