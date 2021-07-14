import {inject} from 'vue'
import {ActionState} from '../../frontend/interfaces/ActionState';
import {moldComposition} from './composition/moldComposition';
import {ActionProps} from '../../frontend/interfaces/ActionProps';
import {GetCompositionState} from './composition/getComposition';
import {ListResponse} from '../../interfaces/ReponseStructure';
import Mold from '../../frontend/Mold'
import {VUE_CONTEXT_NAME} from './constants'


export default function useMoldGetFirst<T>(
  set: string,
  query?: Record<string, any>,
  backend?: string,
  disableInitialLoad?: boolean
): GetCompositionState<T> {
  const mold = inject<Mold>(VUE_CONTEXT_NAME)

  if (!mold) throw new Error(`Can't get mold from app context`)

  const actionProps: ActionProps = {
    backend,
    set,
    action: 'find',
    query: {
      ...query,
      page: 1,
      pageSize: 1,
    },
  };
  const stateTransform = (newState: ActionState<ListResponse<T>>) => {
    return {
      ...newState,
      item: newState.result?.data?.[0] || null,
    }
  }

  const state = moldComposition<ListResponse<T>>(
    actionProps,
    stateTransform
  ) as GetCompositionState<T>

  if (!disableInitialLoad) {
    // start request immediately
    mold.start(state.$instanceId)
  }

  state.load = () => {
    mold.start(state.$instanceId)
  }

  return state
}
