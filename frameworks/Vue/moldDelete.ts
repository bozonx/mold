import {SetupContext} from '@vue/composition-api';

import {InstanceActionState} from '../../frontend/interfaces/ActionState';
import {saveComposition} from './composition/saveComposition';
import {GetQuery} from '../../interfaces/GetQuery';


export default function moldDelete<T>(
  context: SetupContext,
  set: string,
  idOrQuery?: (string | number) | GetQuery,
  backend?: string,
): InstanceActionState<T> & {delete: () => void} {
  const {mold, instanceId, state} = saveComposition<T>(
    context,
    {
      backend,
      set,
      action: 'delete',
      query: (typeof idOrQuery === 'string' || typeof idOrQuery === 'number')
        ? { id: idOrQuery }
        : idOrQuery,
    },
    {
      delete: () => mold.start(instanceId),
    }
  );

  return state as InstanceActionState<T> & {delete: () => void};
}
