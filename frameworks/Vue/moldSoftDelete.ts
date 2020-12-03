import {SetupContext} from '@vue/composition-api';

import {saveComposition} from './composition/saveComposition';
import {InstanceActionState} from '../../frontend/interfaces/ActionState';
import {JsonTypes} from '../../interfaces/Types';


export default function moldSoftDelete<T>(
  context: SetupContext,
  set: string,
  id: string | number,
  query?: Record<string, JsonTypes>,
  backend?: string,
  deletedPropName: string = 'deleted'
): InstanceActionState<T> & {delete: () => void} {
  const {mold, instanceId, state} = saveComposition<T>(
    context,
    {
      backend,
      set,
      action: 'patch',
      query: { id },
    },
    {
      delete: () => {
        mold.start(instanceId, {[deletedPropName]: true});
      }
    }
  );

  return state as InstanceActionState<T> & {delete: () => void};
}
