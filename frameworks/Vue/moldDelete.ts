import {onUnmounted, reactive, SetupContext} from '@vue/composition-api';
import {HighLevelProps} from '../../frontend/interfaces/MethodsProps';
import {ActionState, InstanceActionState} from '../../frontend/interfaces/MethodsState';
import {saveComposition, SaveCompositionAdditionalProps} from './composition/saveComposition';
import Mold from '../../frontend/Mold';
import {INSTANCE_ID_PROP_NAME} from '../../frontend/constants';


export default function moldDelete<T>(
  context: SetupContext,
  actionProps: HighLevelProps
): InstanceActionState<T> & SaveCompositionAdditionalProps {

}
