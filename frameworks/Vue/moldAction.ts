import {SetupContext} from '@vue/composition-api';
import {InstanceActionState} from '../../frontend/interfaces/ActionState';
import {saveComposition, SaveCompositionAdditionalProps} from './composition/saveComposition';


export default function moldAction<T>(
  context: SetupContext,
  set: string,
  actionName: string,
  query?: Record<string, any>,
  backend?: string
): InstanceActionState<T> & SaveCompositionAdditionalProps {
  const {state} = saveComposition<T>(context, {
    backend,
    set,
    action: actionName,
    query,
  });

  return state as InstanceActionState<T> & SaveCompositionAdditionalProps;
}
