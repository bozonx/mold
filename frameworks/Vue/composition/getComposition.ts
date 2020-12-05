import {SetupContext} from '@vue/composition-api';

import {ActionState} from '../../../frontend/interfaces/ActionState';
import {omitObj} from '../../../helpers/objects';
import {moldComposition} from './moldComposition';
import {ActionProps} from '../../../frontend/interfaces/ActionProps';
import {ItemResponse} from '../../../interfaces/ReponseStructure';


export interface GetCompositionProps extends Omit<ActionProps, 'isReading'> {
  disableInitialLoad?: boolean
}

export interface GetCompositionState<T> extends ActionState {
  // it is result.data
  item: T | null;
  load: (queryOverride?: Record<string, any>) => void;
}


export function getComposition<T>(
  context: SetupContext,
  actionProps: GetCompositionProps
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
    ...omitObj(actionProps, 'disableInitialLoad') as ActionProps,
    isReading: true,
  }, stateTransform);

  if (!actionProps.disableInitialLoad) {
    // start request immediately
    mold.start(instanceId);
  }

  const state: GetCompositionState<T> = moldState as any;

  state.load = (queryOverride?: Record<string, any>) => {
    mold.start(instanceId, undefined, queryOverride);
  };

  return state;
}
