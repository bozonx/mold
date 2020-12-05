import {ActionState} from '../../../frontend/interfaces/ActionState';
import {SetupContext} from '@vue/composition-api';
import {omitObj} from '../../../helpers/objects';
import {moldComposition} from './moldComposition';
import {ActionProps} from '../../../frontend/interfaces/ActionProps';
import {ItemResponse} from '../../../interfaces/ReponseStructure';


export interface GetCompositionProps extends Omit<ActionProps, 'isReading'> {
  disableInitialLoad?: boolean
}

export interface GetCompositionState<T> extends ActionState, Omit<ItemResponse, 'data'> {
  // replace result.data to this
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
      ...omitObj(newState.result, 'data') as Omit<ItemResponse, 'data'>,
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
