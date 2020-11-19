import {SetupContext} from '@vue/composition-api';

import {getComposition, GetCompositionState} from './composition/getComposition';
import {RetrieveCompositionProps} from './composition/retrieveComposition';


export default function moldGet<T>(
  context: SetupContext,
  actionProps: RetrieveCompositionProps
): GetCompositionState<T> {
  const {state} = getComposition<T>(context, 'get', actionProps);

  return state;
}
