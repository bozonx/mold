import {SetupContext} from '@vue/composition-api';
import {HighLevelProps} from '../../frontend/interfaces/MethodsProps';
import {saveComposition} from './composition/saveComposition';
import {InstanceActionState} from '../../frontend/interfaces/MethodsState';


export default function moldSoftDelete<T>(
  context: SetupContext,
  actionProps: HighLevelProps,
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
