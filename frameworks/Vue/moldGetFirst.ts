import {SetupContext} from '@vue/composition-api';
import {retrieveComposition, RetrieveCompositionProps} from './composition/retrieveComposition';
import {GetCompositionState} from './composition/getComposition';
import {ActionState, ListResponse} from '../../frontend/interfaces/MethodsState';
import {omitObj} from '../../helpers/objects';


export default function moldGetFirst<T>(
  context: SetupContext,
  actionProps: RetrieveCompositionProps
): GetCompositionState<T> {
  const {state} = retrieveComposition<GetCompositionState<T>>(
    context,
    'find',

    // TODO: указать параметры page: 1, perPage: 1

    actionProps,
    (newState: ActionState<ListResponse<T>>): GetCompositionState<T> => {
      return {
        ...omitObj(newState, 'result') as Omit<ActionState<T>, 'result'>,
        item: newState.result?.data && newState.result?.data[0] || null,
      };
    }
  );

  return state;
}