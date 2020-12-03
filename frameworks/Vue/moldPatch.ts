import {SetupContext} from '@vue/composition-api';

import {InstanceActionState} from '../../frontend/interfaces/ActionState';
import {saveComposition, SaveCompositionAdditionalProps} from './composition/saveComposition';
import {JsonTypes} from '../../interfaces/Types';
import {MoldDocument} from '../../interfaces/MoldDocument';


export default function moldPatch<T>(
  context: SetupContext,
  set: string,
  data: MoldDocument,
  query?: Record<string, JsonTypes>,
  backend?: string
): InstanceActionState<T> & SaveCompositionAdditionalProps {
  const {state} = saveComposition<T>(context, {
    backend,
    set,
    action: 'patch',
    data,
    query,
  });

  return state as InstanceActionState<T> & SaveCompositionAdditionalProps;
}
