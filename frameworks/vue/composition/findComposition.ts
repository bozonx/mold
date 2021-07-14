import {inject} from 'vue'
import {ActionState} from '../../../frontend/interfaces/ActionState';
import {omitObj} from '../../../helpers/objects';
import {ListResponse} from '../../../interfaces/ReponseStructure';
import {InstanceState, moldComposition} from './moldComposition'
import {ActionProps} from '../../../frontend/interfaces/ActionProps';
import Mold from '../../../frontend/Mold'
import {VUE_CONTEXT_NAME} from '../constants'


export interface FindCompositionState<T> extends ActionState, InstanceState, Omit<ListResponse, 'data'> {
  // replace result.data to this
  items: T[] | null;
  load: (queryOverride?: Record<string, any>) => void;
}


export function findComposition<T>(
  actionProps: ActionProps,
  disableInitialLoad: boolean = false
): FindCompositionState<T> {
  const mold = inject<Mold>(VUE_CONTEXT_NAME)

  if (!mold) throw new Error(`Can't get mold from app context`)

  const stateTransform = (
    newState: ActionState<ListResponse<T>>
  ): Omit<FindCompositionState<T>, 'load'> => {
    return {
      ...newState,
      ...omitObj(newState.result, 'data') as Omit<ListResponse, 'data'>,
      items: newState.result?.data || null,
    }
  }
  // isReading param will be set at mold.request.register() method
  const moldState = moldComposition<ListResponse<T>>(
    { ...actionProps, isReading: true },
    stateTransform
  )

  if (!disableInitialLoad) {
    // start request immediately
    mold.start(moldState.$instanceId)
  }

  const state: FindCompositionState<T> = moldState as any;

  state.load = () => {
    mold.start(moldState.$instanceId);
  };

  return state
}
