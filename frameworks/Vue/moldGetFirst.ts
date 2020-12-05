import {SetupContext} from '@vue/composition-api';

import {ActionState} from '../../frontend/interfaces/ActionState';
import {moldComposition} from './composition/moldComposition';
import {ActionProps} from '../../frontend/interfaces/ActionProps';
import {GetCompositionState} from './composition/getComposition';
import {ListResponse} from '../../interfaces/ReponseStructure';


export default function moldGetFirst<T>(
  context: SetupContext,
  set: string,
  query?: Record<string, any>,
  backend?: string
): GetCompositionState<T> {
  const actionProps: ActionProps = {
    backend,
    set,
    action: 'find',
    query: {
      ...query,
      page: 1,
      pageSize: 1,
    },
    isReading: true,
  };
  const stateTransform = (
    newState: ActionState<ListResponse<T>>
  ): Omit<GetCompositionState<T>, 'load'> => {
    return {
      ...newState,
      item: newState.result?.data?.[0] || null,
    };
  }

  const {mold, instanceId, state: moldState} = moldComposition<ListResponse<T>>(
    context,
    actionProps,
    stateTransform
  );

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
