import {SetupContext} from '@vue/composition-api';
import {InstanceActionState} from '../../frontend/interfaces/ActionState';
import {saveComposition, SaveCompositionAdditionalProps} from './composition/saveComposition';
import {CompositionProps} from '../../frontend/interfaces/CompositionProps';


export default function moldCreate<T>(
  context: SetupContext,
  actionProps: CompositionProps
): InstanceActionState<T> & SaveCompositionAdditionalProps {
  const {state} = saveComposition<T>(context, 'create', actionProps);

  return state as InstanceActionState<T> & SaveCompositionAdditionalProps;
}
