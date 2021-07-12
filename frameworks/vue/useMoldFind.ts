import {findComposition, FindCompositionState} from './composition/findComposition';
import {FindQuery} from '../../interfaces/FindQuery';


export default function useMoldFind<T>(
  set: string,
  query?: FindQuery,
  backend?: string,
  disableInitialLoad?: boolean
): FindCompositionState<T> {
  return findComposition<T>({
    backend,
    set,
    action: 'find',
    query,
  }, disableInitialLoad);
}
