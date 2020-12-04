import {SetupContext} from '@vue/composition-api';
import {ActionState} from '../../frontend/interfaces/ActionState';
import {saveComposition, SaveCompositionAdditionalProps} from './composition/saveComposition';


export default function moldAction<T>(
  context: SetupContext,
  set: string,
  actionName: string,
  query?: Record<string, any>,
  backend?: string
): ActionState<T> & SaveCompositionAdditionalProps {
  const {state} = saveComposition<T>(context, {
    backend,
    set,
    action: actionName,
    query,
  });

  return state as ActionState<T> & SaveCompositionAdditionalProps;
}
