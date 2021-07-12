import {ActionState} from '../../../frontend/interfaces/ActionState';
import {omitObj} from '../../../helpers/objects';
import {ListResponse} from '../../../interfaces/ReponseStructure';
import {moldComposition} from './moldComposition';
import {ActionProps} from '../../../frontend/interfaces/ActionProps';


export interface FindCompositionState<T> extends ActionState, Omit<ListResponse, 'data'> {
  // replace result.data to this
  items: T[] | null;
  load: (queryOverride?: Record<string, any>) => void;
}


export function findComposition<T>(
  actionProps: ActionProps,
  disableInitialLoad: boolean = false
): FindCompositionState<T> {
  const stateTransform = (
    newState: ActionState<ListResponse<T>>
  ): Omit<FindCompositionState<T>, 'load'> => {
    return {
      ...newState,
      ...omitObj(newState.result, 'data') as Omit<ListResponse, 'data'>,
      items: newState.result?.data || null,
    };
  }
  // isReading param will be set at mold.request.register() method
  const {mold, instanceId, state: moldState} = moldComposition<ListResponse<T>>(
    { ...actionProps, isReading: true },
    stateTransform
  );

  if (!disableInitialLoad) {
    // start request immediately
    mold.start(instanceId);
  }

  const state: FindCompositionState<T> = moldState as any;

  state.load = () => {
    mold.start(instanceId);
  };

  return state;
}
