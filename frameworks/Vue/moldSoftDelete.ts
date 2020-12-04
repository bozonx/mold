import {SetupContext} from '@vue/composition-api';

import {saveComposition} from './composition/saveComposition';
import {ActionState} from '../../frontend/interfaces/ActionState';
import {GetQuery} from '../../interfaces/GetQuery';


export default function moldSoftDelete<T>(
  context: SetupContext,
  set: string,
  idOrQuery?: (string | number) | GetQuery,
  backend?: string,
  deletedPropName: string = 'deleted'
): ActionState<T> & {delete: () => void} {
  const {mold, instanceId, state} = saveComposition<T>(
    context,
    {
      backend,
      set,
      action: 'patch',
      query: (typeof idOrQuery === 'string' || typeof idOrQuery === 'number')
        ? { id: idOrQuery }
        : idOrQuery,
    },
    {
      delete: () => mold.start(instanceId, {[deletedPropName]: true}),
    }
  );

  return state as ActionState<T> & {delete: () => void};
}
