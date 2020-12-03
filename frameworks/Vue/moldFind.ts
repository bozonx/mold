import {SetupContext} from '@vue/composition-api';

import {findComposition, FindCompositionState} from './composition/findComposition';
import {FindQuery} from '../../interfaces/FindQuery';


export default function moldFind<T>(
  context: SetupContext,
  set: string,
  query?: FindQuery,
  backend?: string
): FindCompositionState<T> {
  const {state} = findComposition<T>(context, {
    backend,
    set,
    action: 'find',
    query,
  });

  return state;
}
