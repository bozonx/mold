import {SetupContext} from '@vue/composition-api';
import {HighLevelProps} from '../../frontend/interfaces/MethodsProps';
import {InstanceActionState} from '../../frontend/interfaces/MethodsState';
import {saveComposition} from './composition/saveComposition';


export default function moldSoftDelete<T>(
  context: SetupContext,
  actionProps: HighLevelProps
): InstanceActionState<T> & {delete: () => void} {
  const {mold, instanceId, state} = saveComposition<T>(
    context,
    'patch',
    actionProps,
    {
      delete: () => {
        mold.start(instanceId, {[mold.props.config.deletedPropName]: true});
      }
    }
  );

  return state as InstanceActionState<T> & {delete: () => void};
}
