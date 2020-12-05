import {SetupContext} from '@vue/composition-api';

import {getComposition, GetCompositionState} from './composition/getComposition';
import {GetQuery} from '../../interfaces/GetQuery';


export default function moldGet<T>(
  context: SetupContext,
  set: string,
  idOrQuery?: (string | number) | GetQuery,
  backend?: string,
  disableInitialLoad?: boolean
): GetCompositionState<T> {
  return getComposition<T>(context, {
    backend,
    set,
    action: 'get',
    query: (typeof idOrQuery === 'string' || typeof idOrQuery === 'number')
      ? { id: idOrQuery }
      : idOrQuery,
  }, disableInitialLoad);
}
