import {inject} from 'vue'
import {omitObj} from '../../../helpers/objects'
import {ListResponse} from '../../../interfaces/ReponseStructure'
import {InstanceState, moldComposition} from './moldComposition'
import {ActionProps} from '../../../frontend/interfaces/ActionProps'
import Mold from '../../../frontend/Mold'
import {VUE_CONTEXT_NAME} from '../constants'
import {ActionState} from '../../../frontend/interfaces/ActionState'


export interface FindCompositionState<T> extends InstanceState, Omit<ListResponse, 'data'> {
  // it's a replacing of result.data
  items: T[] | null
  // TODO: а queryOverride нужен???
  load: (queryOverride?: Record<string, any>) => void
}


export function findComposition<T>(
  actionProps: ActionProps,
  disableInitialLoad: boolean = false
): FindCompositionState<T> {
  const mold = inject<Mold>(VUE_CONTEXT_NAME)

  if (!mold) throw new Error(`Can't get mold from app context`)

  const stateTransform = (newState: ActionState<ListResponse<T>>) => {
    return {
      ...newState,
      ...omitObj(newState.result, 'data') as Omit<ListResponse, 'data'>,
      items: newState.result?.data || null,
    }
  }
  // isReading param will be set at mold.request.register() method
  const state = moldComposition<ListResponse<T>>(
    // TODO: почему isReading true, если можно не запускать изначально load??
    { ...actionProps, isReading: true },
    stateTransform
  ) as FindCompositionState<T>

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
