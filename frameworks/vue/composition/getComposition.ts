import {inject} from 'vue'
import {ActionState} from '../../../frontend/interfaces/ActionState'
import {InstanceState, moldComposition} from './moldComposition'
import {ActionProps} from '../../../frontend/interfaces/ActionProps'
import {ItemResponse} from '../../../interfaces/ReponseStructure'
import Mold from '../../../frontend/Mold'
import {VUE_CONTEXT_NAME} from '../constants'


export interface GetCompositionState<T> extends InstanceState {
  // it is result.data
  item: T | null
  // TODO: а queryOverride нужен???
  load: (queryOverride?: Record<string, any>) => void
}


export function getComposition<T>(
  actionProps: ActionProps,
  disableInitialLoad: boolean = false
): GetCompositionState<T> {
  const mold = inject<Mold>(VUE_CONTEXT_NAME)

  if (!mold) throw new Error(`Can't get mold from app context`)

  const stateTransform = (newState: ActionState<ItemResponse<T>>) => {
    return {
      ...newState,
      item: newState.result?.data || null,
    }
  }
  // isReading param will be set at mold.request.register() method
  const state = moldComposition<ItemResponse<T>>(
    { ...actionProps, isReading: true },
    stateTransform
  ) as GetCompositionState<T>

  if (!disableInitialLoad) {
    // start request immediately
    mold.start(state.$instanceId)
  }

  // TODO: а где queryOverride???
  state.load = () => {
    mold.start(state.$instanceId)
  }

  return state
}
