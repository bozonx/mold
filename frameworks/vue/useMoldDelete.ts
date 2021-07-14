import {inject} from 'vue'
import Mold from '../../frontend/Mold'
import {InstanceState, moldComposition} from './composition/moldComposition'
import {GetQuery} from '../../interfaces/GetQuery'
import {VUE_CONTEXT_NAME} from './constants'


interface MoldDeleteState<T> extends InstanceState<T> {
  delete: (queryOverride?: Record<string, any>) => void
}


export default function useMoldDelete<T>(
  set: string,
  idOrQuery?: (string | number) | GetQuery,
  backend?: string,
): MoldDeleteState<T> {
  const mold = inject<Mold>(VUE_CONTEXT_NAME)

  if (!mold) throw new Error(`Can't get mold from app context`)

  const state = moldComposition<T>({
    backend,
    set,
    action: 'delete',
    query: (typeof idOrQuery === 'string' || typeof idOrQuery === 'number')
      ? { id: idOrQuery }
      : idOrQuery,
  }) as MoldDeleteState<T>

  state.delete = () => {
    mold.start(state.$instanceId)
  }

  return state
}
