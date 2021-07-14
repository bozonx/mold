import {InstanceState, moldComposition} from './composition/moldComposition'
import {inject} from 'vue'
import Mold from '../../frontend/Mold'
import {VUE_CONTEXT_NAME} from './constants'


interface MoldActionState<T> extends InstanceState<T> {
  start: (data?: Record<string, any>, queryOverride?: Record<string, any>) => void;
}


export default function useMoldAction<T>(
  set: string,
  actionName: string,
  query?: Record<string, any>,
  backend?: string
): MoldActionState<T> {
  const mold = inject<Mold>(VUE_CONTEXT_NAME)

  if (!mold) throw new Error(`Can't get mold from app context`)

  const state = moldComposition<T>({
    backend,
    set,
    action: actionName,
    query,
  }) as MoldActionState<T>

  state.start = (data?: Record<string, any>) => {
    mold.start(state.$instanceId, data)
  }

  return state
}
