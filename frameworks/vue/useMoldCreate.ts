import {InstanceState, moldComposition} from './composition/moldComposition'
import {JsonTypes} from '../../interfaces/Types'
import {MoldDocument} from '../../interfaces/MoldDocument'
import {inject} from 'vue'
import Mold from '../../frontend/Mold'
import {VUE_CONTEXT_NAME} from './constants'


interface MoldCreateState<T> extends InstanceState<T> {
  create: (data: Partial<MoldDocument>, queryOverride?: Record<string, any>) => void
}


export default function useMoldCreate<T>(
  set: string,
  query?: Record<string, JsonTypes>,
  backend?: string
): MoldCreateState<T> {
  const mold = inject<Mold>(VUE_CONTEXT_NAME)

  if (!mold) throw new Error(`Can't get mold from app context`)

  const state = moldComposition<T>({
    backend,
    set,
    action: 'create',
    query,
  }) as MoldCreateState<T>

  state.create = (data: Partial<MoldDocument>) => {
    mold.start(state.$instanceId, data)
  }

  return state
}
