import {SetupContext} from '@vue/composition-api';

import {saveComposition} from './composition/saveComposition';
import {InstanceActionState} from '../../frontend/interfaces/ActionState';
import {CompositionProps} from '../../frontend/interfaces/CompositionProps';


export default function moldSoftDelete<T>(
  context: SetupContext,
  actionProps: CompositionProps,
  deletedPropName: string = 'deleted'
): InstanceActionState<T> & {delete: () => void} {
  const {mold, instanceId, state} = saveComposition<T>(
    context,
    'patch',
    actionProps,
    {
      delete: () => {
        mold.start(instanceId, {[deletedPropName]: true});
      }
    }
  );

  return state as InstanceActionState<T> & {delete: () => void};
}
