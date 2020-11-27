import {SetupContext} from '@vue/composition-api';

import {InstanceActionState} from '../../frontend/interfaces/MethodsState';
import {saveComposition, SaveCompositionAdditionalProps} from './composition/saveComposition';
import {CompositionProps} from '../../frontend/interfaces/CompositionProps';


export default function moldSave<T>(
  context: SetupContext,
  actionProps: CompositionProps
): InstanceActionState<T> & SaveCompositionAdditionalProps {
  const actionName = (
    typeof actionProps.id === 'string'
    || typeof actionProps.id === 'number'
  ) ? 'patch' : 'create';
  const {state} = saveComposition<T>(context, actionName, actionProps);

  return state as InstanceActionState<T> & SaveCompositionAdditionalProps;
}
