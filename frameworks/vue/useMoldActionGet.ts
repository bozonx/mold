import {getComposition, GetCompositionState} from './composition/getComposition'
import {GetQuery} from '../../interfaces/GetQuery'


export default function useMoldActionGet<T>(
  set: string,
  actionName: string,
  idOrQuery?: (string | number) | GetQuery,
  backend?: string,
  disableInitialLoad?: boolean
): GetCompositionState<T> {
  return getComposition<T>({
    backend,
    set,
    action: actionName,
    query: (typeof idOrQuery === 'string' || typeof idOrQuery === 'number')
      ? { id: idOrQuery }
      : idOrQuery,
  }, disableInitialLoad)
}
