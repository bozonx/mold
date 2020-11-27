import {SetupContext} from '@vue/composition-api';
import {InstanceActionState} from '../../frontend/interfaces/ActionState';
import {saveComposition} from './composition/saveComposition';
import {CompositionProps} from '../../frontend/interfaces/CompositionProps';


export default function moldDelete<T>(
  context: SetupContext,
  actionProps: CompositionProps
): InstanceActionState<T> & {delete: () => void} {
  const {mold, instanceId, state} = saveComposition<T>(
    context,
    'delete',
    actionProps,
    {
      delete: () => mold.start(instanceId)
    }
  );

  return state as InstanceActionState<T> & {delete: () => void};
}
