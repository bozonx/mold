import {SetupContext} from '@vue/composition-api';

import {findComposition, FindCompositionState} from './composition/findComposition';
import {FindQuery} from '../../interfaces/FindQuery';


export default function moldActionFind<T>(
  context: SetupContext,
  set: string,
  actionName: string,
  query?: FindQuery,
  backend?: string
): FindCompositionState<T> {
  const {state} = findComposition<T>(context, {
    action: actionName,
    backend,
    set,
    query,
  });

  return state;
}
