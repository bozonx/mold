import {findComposition, FindCompositionState} from './composition/findComposition'
import {FindQuery} from '../../interfaces/FindQuery'


export default function useMoldActionFind<T>(
  set: string,
  actionName: string,
  query?: FindQuery,
  backend?: string,
  disableInitialLoad?: boolean
): FindCompositionState<T> {
  return findComposition<T>({
    backend,
    set,
    action: actionName,
    query,
  }, disableInitialLoad)
}
