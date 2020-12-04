import {SetupContext} from '@vue/composition-api';

import {ActionState} from '../../frontend/interfaces/ActionState';
import {saveComposition, SaveCompositionAdditionalProps} from './composition/saveComposition';
import {GetQuery} from '../../interfaces/GetQuery';


export default function moldPatch<T>(
  context: SetupContext,
  set: string,
  idOrQuery?: (string | number) | GetQuery,
  backend?: string
): ActionState<T> & SaveCompositionAdditionalProps {
  const {state} = saveComposition<T>(context, {
    backend,
    set,
    action: 'patch',
    query: (typeof idOrQuery === 'string' || typeof idOrQuery === 'number')
      ? { id: idOrQuery }
      : idOrQuery,
  });

  return state as ActionState<T> & SaveCompositionAdditionalProps;
}
