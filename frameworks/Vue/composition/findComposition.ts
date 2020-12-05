import {SetupContext} from '@vue/composition-api';

import {ActionState} from '../../../frontend/interfaces/ActionState';
import {omitObj} from '../../../helpers/objects';
import {ListResponse} from '../../../interfaces/ReponseStructure';
import {moldComposition} from './moldComposition';
import {ActionProps} from '../../../frontend/interfaces/ActionProps';


export type FindCompositionProps = Omit<ActionProps, 'isReading'>;

export interface FindCompositionState<T> extends ActionState, Omit<ListResponse, 'data'> {
  // replace result.data to this
  items: T[] | null;
  load: (queryOverride?: Record<string, any>) => void;
}


export function findComposition<T>(
  context: SetupContext,
  actionProps: FindCompositionProps,
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

  const {mold, instanceId, state: moldState} = moldComposition<ListResponse<T>>(context, {
    ...omitObj(actionProps, 'disableInitialLoad') as ActionProps,
    isReading: true,
  }, stateTransform);

  if (!disableInitialLoad) {
    // start request immediately
    mold.start(instanceId);
  }

  const state: FindCompositionState<T> = moldState as any;

  state.load = (queryOverride?: Record<string, any>) => {
    mold.start(instanceId, undefined, queryOverride);
  };

  return state;
}
