import {SetupContext} from '@vue/composition-api';
import {InstanceActionState} from '../../frontend/interfaces/MethodsState';
import {saveComposition, SaveCompositionAdditionalProps} from './composition/saveComposition';
import {CompositionProps} from '../../frontend/interfaces/CompositionProps';


export default function moldAction<T>(
  context: SetupContext,
  actionName: string,
  actionProps: CompositionProps
): InstanceActionState<T> & SaveCompositionAdditionalProps {
  const {state} = saveComposition<T>(context, actionName, actionProps);

  return state as InstanceActionState<T> & SaveCompositionAdditionalProps;
}
