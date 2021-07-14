import {inject} from 'vue'
import {InstanceState, moldComposition} from './composition/moldComposition'
import {JsonTypes} from '../../interfaces/Types'
import {MoldDocument} from '../../interfaces/MoldDocument'
import Mold from '../../frontend/Mold'
import {VUE_CONTEXT_NAME} from './constants'


interface MoldBatchCreateState<T> extends InstanceState<T> {
  create: (docs: Partial<MoldDocument>[], queryOverride?: Record<string, any>) => void
}


export default function useMoldBatchCreate<T>(
  set: string,
  query?: Record<string, JsonTypes>,
  backend?: string
): MoldBatchCreateState<T> {
  const mold = inject<Mold>(VUE_CONTEXT_NAME)

  if (!mold) throw new Error(`Can't get mold from app context`)

  const state = moldComposition<T>( {
    backend,
    set,
    action: 'batchCreate',
    query,
  }) as MoldBatchCreateState<T>

  state.create = (docs: Partial<MoldDocument>[]) => {
    mold.start(state.$instanceId, docs)
  }

  return state
}
