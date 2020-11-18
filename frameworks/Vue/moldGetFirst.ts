import {SetupContext} from '@vue/composition-api';
import {HighLevelProps} from '../../frontend/interfaces/MethodsProps';
import {InstanceActionState, ItemResponse} from '../../frontend/interfaces/MethodsState';
import {retrieveComposition} from './composition/retrieveComposition';


// TODO: add getFirst


export default function moldGetFirst<T>(
  context: SetupContext,
  actionProps: HighLevelProps & { dontLoadImmediately: boolean }
): InstanceActionState<ItemResponse<T>> & {load: () => void} {
  const {state} = retrieveComposition<ItemResponse<T>>(context, 'get', actionProps);

  return state;
}
