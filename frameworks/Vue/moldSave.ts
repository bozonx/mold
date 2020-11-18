import {SetupContext} from '@vue/composition-api';
import {HighLevelProps} from '../../frontend/interfaces/MethodsProps';
import {InstanceActionState} from '../../frontend/interfaces/MethodsState';
import {saveComposition, SaveCompositionAdditionalProps} from './composition/saveComposition';


export default function moldSave<T>(
  context: SetupContext,
  actionProps: HighLevelProps & { dontLoadImmediately: boolean }
): InstanceActionState<T> & SaveCompositionAdditionalProps {
  const {state} = saveComposition<T>(context, undefined, actionProps);

  return state;
}
