import {inject} from 'vue'
import {InstanceState, moldComposition} from './composition/moldComposition'
import {JsonTypes} from '../../interfaces/Types'
import Mold from '../../frontend/Mold'
import {VUE_CONTEXT_NAME} from './constants'


interface MoldBatchDeleteState<T> extends InstanceState<T> {
  delete: (ids: (string | number)[], queryOverride?: Record<string, any>) => void
}


export default function useMoldBatchDelete<T>(
  set: string,
  query?: Record<string, JsonTypes>,
  backend?: string
): MoldBatchDeleteState<T> {
  const mold = inject<Mold>(VUE_CONTEXT_NAME)

  if (!mold) throw new Error(`Can't get mold from app context`)

  const state = moldComposition<T>({
    backend,
    set,
    action: 'batchDelete',
    query,
  }) as MoldBatchDeleteState<T>

  state.delete = (ids: (string | number)[]) => {
    mold.start(state.$instanceId, ids)
  }

  return state
}
