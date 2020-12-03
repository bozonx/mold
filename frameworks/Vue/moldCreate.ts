import {SetupContext} from '@vue/composition-api';

import {InstanceActionState} from '../../frontend/interfaces/ActionState';
import {saveComposition, SaveCompositionAdditionalProps} from './composition/saveComposition';
import {JsonTypes} from '../../interfaces/Types';


export default function moldCreate<T>(
  context: SetupContext,
  set: string,
  data: Record<string, JsonTypes>,
  query?: Record<string, JsonTypes>,
  backend?: string
): InstanceActionState<T> & SaveCompositionAdditionalProps {
  const {state} = saveComposition<T>(context, {
    backend,
    set,
    action: 'create',
    data,
    query,
  });

  return state as InstanceActionState<T> & SaveCompositionAdditionalProps;
}
