import {SetupContext} from '@vue/composition-api';

import {findComposition, FindCompositionState} from './composition/findComposition';
import {FindQuery} from '../../interfaces/FindQuery';


export default function moldActionFind<T>(
  context: SetupContext,
  set: string,
  actionName: string,
  query?: FindQuery,
  backend?: string,
  disableInitialLoad?: boolean
): FindCompositionState<T> {
  return findComposition<T>(context, {
    backend,
    set,
    action: actionName,
    query,
    isReading: true,
  }, disableInitialLoad);
}
