import {SetupContext} from '@vue/composition-api';
import {HighLevelProps} from '../../frontend/interfaces/MethodsProps';
import {InstanceActionState} from '../../frontend/interfaces/MethodsState';
import {saveComposition, SaveCompositionAdditionalProps} from './composition/saveComposition';


export default function moldActionGet<T>(
  context: SetupContext,
  actionName: string,
  actionProps: HighLevelProps & { dontLoadImmediately: boolean }
): InstanceActionState<T> & SaveCompositionAdditionalProps {
  const {state} = saveComposition<T>(context, actionName, actionProps);

  return state;
}
