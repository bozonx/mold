import {inject} from 'vue'
import {InstanceState, moldComposition} from './composition/moldComposition'
import {GetQuery} from '../../interfaces/GetQuery'
import {MoldDocument} from '../../interfaces/MoldDocument'
import Mold from '../../frontend/Mold'
import {VUE_CONTEXT_NAME} from './constants'


interface MoldPatchState<T> extends InstanceState<T> {
  patch: (data: MoldDocument, queryOverride?: Record<string, any>) => void
}


export default function useMoldPatch<T>(
  set: string,
  idOrQuery?: (string | number) | GetQuery,
  backend?: string
): MoldPatchState<T> {
  const mold = inject<Mold>(VUE_CONTEXT_NAME)

  if (!mold) throw new Error(`Can't get mold from app context`)

  const state = moldComposition<T>({
    backend,
    set,
    action: 'patch',
    query: (typeof idOrQuery === 'string' || typeof idOrQuery === 'number')
      ? { id: idOrQuery }
      : idOrQuery,
  }) as MoldPatchState<T>

  state.patch = (data: MoldDocument) => {
    mold.start(state.$instanceId, data)
  }

  return state
}
