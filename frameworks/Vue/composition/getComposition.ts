import {SetupContext} from '@vue/composition-api';

import {ActionState} from '../../../frontend/interfaces/ActionState';
import {omitObj} from '../../../helpers/objects';
import {moldComposition} from './moldComposition';
import {ActionProps} from '../../../frontend/interfaces/ActionProps';
import {ItemResponse} from '../../../interfaces/ReponseStructure';


export type GetCompositionProps = Omit<ActionProps, 'isReading'>;

export interface GetCompositionState<T> extends ActionState {
  // it is result.data
  item: T | null;
  load: (queryOverride?: Record<string, any>) => void;
}


export function getComposition<T>(
  context: SetupContext,
  actionProps: GetCompositionProps,
  disableInitialLoad: boolean = false
): GetCompositionState<T> {
  const stateTransform = (
    newState: ActionState<ItemResponse<T>>
  ): Omit<GetCompositionState<T>, 'load'> => {
    return {
      ...newState,
      item: newState.result?.data || null,
    };
  }

  const {mold, instanceId, state: moldState} = moldComposition<ItemResponse<T>>(context, {
    ...actionProps,
    isReading: true,
  }, stateTransform);

  if (!disableInitialLoad) {
    // start request immediately
    mold.start(instanceId);
  }

  const state: GetCompositionState<T> = moldState as any;

  state.load = (queryOverride?: Record<string, any>) => {
    mold.start(instanceId, undefined, queryOverride);
  };

  return state;
}
