import {SetupContext} from '@vue/composition-api';
import {HighLevelProps} from '../../frontend/interfaces/MethodsProps';
import {InstanceActionState, ItemResponse} from '../../frontend/interfaces/MethodsState';
import {retrieveComposition} from './composition/retrieveComposition';


// TODO: add getFirst


export default function moldGetFirst<T>(
  context: SetupContext,
  actionProps: HighLevelProps & { dontLoadImmediately?: boolean }
): InstanceActionState<ItemResponse<T>> & {load: () => void} {
  const {state} = retrieveComposition<ItemResponse<T>>(context, 'find', actionProps);

  // TODO: сделать запрос find, с параметрами page: 1, perPage: 1 и выбрать 1й вариант

  return state;
}
