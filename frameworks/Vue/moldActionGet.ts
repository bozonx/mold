import {SetupContext} from '@vue/composition-api';
import {HighLevelProps} from '../../frontend/interfaces/MethodsProps';
import {InstanceActionState, ItemResponse} from '../../frontend/interfaces/MethodsState';
import {retrieveComposition} from './composition/retrieveComposition';


export default function moldActionGet<T>(
  context: SetupContext,
  actionName: string,
  actionProps: HighLevelProps & { dontLoadImmediately: boolean }
): InstanceActionState<ItemResponse<T>> & {load: () => void} {
  const {state} = retrieveComposition<ItemResponse<T>>(context, actionName, actionProps);

  return state;
}
