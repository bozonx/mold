import {SetupContext} from '@vue/composition-api';
import {HighLevelProps} from '../../frontend/interfaces/MethodsProps';
import {InstanceActionState, ListResponse} from '../../frontend/interfaces/MethodsState';
import {retrieveComposition} from './moldActionGet';


export default function moldActionFind<T>(
  context: SetupContext,
  actionName: string,
  actionProps: HighLevelProps & { dontLoadImmediately: boolean }
): InstanceActionState<ListResponse<T>> & {load: () => void} {
  const {state} = retrieveComposition<ListResponse<T>>(context, actionName, actionProps);

  return state;
}
