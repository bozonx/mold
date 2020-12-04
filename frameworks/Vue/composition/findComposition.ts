import {ActionState} from '../../../frontend/interfaces/ActionState';
import {SetupContext} from '@vue/composition-api';
import {omitObj} from '../../../helpers/objects';
import {RetrieveCompositionProps, retrieveComposition, RetrieveResult} from './retrieveComposition';
import {ListResponse} from '../../../interfaces/ReponseStructure';
import {saveComposition} from './saveComposition';
import {ActionProps} from '../../../frontend/interfaces/ActionProps';
import {MoldDocument} from '../../../interfaces/MoldDocument';


interface RetrieveAdditionalState {
  load: () => void;
}

// load: () => mold.start(instanceId),


export interface FindCompositionState<T> extends
  Omit<ActionState<T>, 'result'>,
  Omit<ListResponse, 'data'>
{
  items: T[] | null;
}


export function findComposition<T>(
  context: SetupContext,
  actionProps: ActionProps
): RetrieveResult<FindCompositionState<T>> {
  const stateTransform = (newState: ActionState<ListResponse<T>>): FindCompositionState<T> => {
    return {
      ...omitObj(newState, 'result') as Omit<ActionState<T>, 'result'>,
      ...omitObj(newState.result, 'data') as Omit<ListResponse, 'data'>,
      items: newState.result?.data || null,
    };
  }

  const {mold, instanceId, state: moldState} = saveComposition<T>(context, {
    // TODO: remove dontLoadImmediately
    ...actionProps,
    isReading: true,
  }, stateTransform);

  if (!actionProps.dontLoadImmediately) {
    // start request immediately
    mold.start(instanceId);
  }

  const state: MoldCreateState<T> = moldState as any;

  state.load = (queryOverride: Record<string, any>) => mold.start(instanceId, data);

  return state;

  // return retrieveComposition<FindCompositionState<T>>(
  //   context,
  //   actionProps,
  //   (newState: ActionState<ListResponse<T>>): FindCompositionState<T> => {
  //     return {
  //       ...omitObj(newState, 'result') as Omit<ActionState<T>, 'result'>,
  //       ...omitObj(newState.result, 'data') as Omit<ListResponse, 'data'>,
  //       items: newState.result?.data || null,
  //     };
  //   }
  // );
}
