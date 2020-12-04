import {SetupContext} from '@vue/composition-api';

import {
  saveComposition,
  SaveCompositionProps,
  compositionSaveFunction
} from './composition/saveComposition';
import {GetQuery} from '../../interfaces/GetQuery';


export default function moldSave<T>(
  context: SetupContext,
  set: string,
  idOrQuery?: (string | number) | GetQuery,
  backend?: string
): SaveCompositionProps<T> {
  const query: GetQuery | undefined = (typeof idOrQuery === 'string' || typeof idOrQuery === 'number')
    ? { id: idOrQuery }
    : idOrQuery;
  const actionName = (typeof query?.id === 'string' || typeof query?.id === 'number')
    ? 'patch'
    : 'create';
  const {instanceId, state: moldState} = saveComposition<T>(context, {
    backend,
    set,
    action: actionName,
    query,
  });

  const state: SaveCompositionProps<T> = moldState as any;

  state.save = (data: Record<string, any>) => compositionSaveFunction(instanceId, data);

  return state;
}
