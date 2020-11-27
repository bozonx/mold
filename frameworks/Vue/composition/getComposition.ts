import {ActionState, ItemResponse} from '../../../frontend/interfaces/ActionState';
import {SetupContext} from '@vue/composition-api';
import {omitObj} from '../../../helpers/objects';
import {RetrieveCompositionProps, retrieveComposition, RetrieveResult} from './retrieveComposition';


export interface GetCompositionState<T> extends
  Omit<ActionState<T>, 'result'>,
  Omit<ItemResponse, 'data'>
{
  item: T | null;
}


export function getComposition<T>(
  context: SetupContext,
  actionName: string,
  actionProps: RetrieveCompositionProps
): RetrieveResult<GetCompositionState<T>> {
  return retrieveComposition<GetCompositionState<T>>(
    context,
    actionName,
    actionProps,
    (newState: ActionState<ItemResponse<T>>): GetCompositionState<T> => {
      return {
        ...omitObj(newState, 'result') as Omit<ActionState<T>, 'result'>,
        ...omitObj(newState.result, 'data') as Omit<ItemResponse, 'data'>,
        item: newState.result?.data || null,
      };
    }
  );
}
