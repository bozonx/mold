import {SetupContext} from '@vue/composition-api';

import {InstanceActionState} from '../../frontend/interfaces/ActionState';
import {saveComposition, SaveCompositionAdditionalProps} from './composition/saveComposition';
import {MoldDocument} from '../../interfaces/MoldDocument';
import {GetQuery} from '../../interfaces/GetQuery';


export default function moldSave<T>(
  context: SetupContext,
  set: string,
  idOrQuery?: (string | number) | GetQuery,
  backend?: string
): InstanceActionState<T> & SaveCompositionAdditionalProps {
  const query: GetQuery | undefined = (typeof idOrQuery === 'string' || typeof idOrQuery === 'number')
    ? { id: idOrQuery }
    : idOrQuery;
  const actionName = (typeof query?.id === 'string' || typeof query?.id === 'number')
    ? 'patch'
    : 'create';
  const {state} = saveComposition<T>(context, {
    backend,
    set,
    action: actionName,
    query,
  });

  return state as InstanceActionState<T> & SaveCompositionAdditionalProps;
}
