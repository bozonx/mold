import {SetupContext} from '@vue/composition-api';

import {RetrieveCompositionProps} from './composition/retrieveComposition';
import {getComposition, GetCompositionState} from './composition/getComposition';


export default function moldActionGet<T>(
  context: SetupContext,
  actionName: string,
  actionProps: RetrieveCompositionProps
): GetCompositionState<T> {
  const {state} = getComposition<T>(context, actionName, actionProps);

  return state;
}
