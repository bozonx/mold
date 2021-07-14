import {inject} from 'vue'
import {InstanceState, moldComposition} from './composition/moldComposition'
import {JsonTypes} from '../../interfaces/Types'
import {MoldDocument} from '../../interfaces/MoldDocument'
import Mold from '../../frontend/Mold'
import {VUE_CONTEXT_NAME} from './constants'


interface MoldBatchPatchState<T> extends InstanceState<T> {
  patch: (docs: MoldDocument[], queryOverride?: Record<string, any>) => void
}


export default function useMoldBatchPatch<T>(
  set: string,
  query?: Record<string, JsonTypes>,
  backend?: string
): MoldBatchPatchState<T> {
  const mold = inject<Mold>(VUE_CONTEXT_NAME)

  if (!mold) throw new Error(`Can't get mold from app context`)

  const state = moldComposition<T>({
    backend,
    set,
    action: 'batchPatch',
    query,
  }) as MoldBatchPatchState<T>

  state.patch = (docs: MoldDocument[]) => {
    mold.start(state.$instanceId, docs)
  }

  return state
}
