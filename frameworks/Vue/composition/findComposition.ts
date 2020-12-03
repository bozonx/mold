import {ActionState} from '../../../frontend/interfaces/ActionState';
import {SetupContext} from '@vue/composition-api';
import {omitObj} from '../../../helpers/objects';
import {RetrieveCompositionProps, retrieveComposition, RetrieveResult} from './retrieveComposition';
import {ListResponse} from '../../../interfaces/ReponseStructure';


export interface FindCompositionState<T> extends
  Omit<ActionState<T>, 'result'>,
  Omit<ListResponse, 'data'>
{
  items: T[] | null;
}


export function findComposition<T>(
  context: SetupContext,
  actionProps: RetrieveCompositionProps
): RetrieveResult<FindCompositionState<T>> {
  return retrieveComposition<FindCompositionState<T>>(
    context,
    actionProps,
    (newState: ActionState<ListResponse<T>>): FindCompositionState<T> => {
      return {
        ...omitObj(newState, 'result') as Omit<ActionState<T>, 'result'>,
        ...omitObj(newState.result, 'data') as Omit<ListResponse, 'data'>,
        items: newState.result?.data || null,
      };
    }
  );
}
