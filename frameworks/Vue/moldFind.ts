import {SetupContext} from '@vue/composition-api';
import {
  InstanceActionState,
  ListResponse
} from '../../frontend/interfaces/MethodsState';
import {HighLevelProps} from '../../frontend/interfaces/MethodsProps';
import {retrieveComposition} from './composition/retrieveComposition';


export default function moldFind<T>(
  context: SetupContext,
  actionProps: HighLevelProps & { dontLoadImmediately: boolean }
): InstanceActionState<ListResponse<T>> & {load: () => void} {
  const {state} = retrieveComposition<ListResponse<T>>(context, 'find', actionProps);

  return state;
}
