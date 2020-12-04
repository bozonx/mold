import {SetupContext} from '@vue/composition-api';

import {ActionState} from '../../frontend/interfaces/ActionState';
import {moldComposition} from './composition/MoldComposition';
import {GetQuery} from '../../interfaces/GetQuery';


interface MoldDeleteState<T> extends ActionState<T> {
  delete: () => void;
}


export default function moldDelete<T>(
  context: SetupContext,
  set: string,
  idOrQuery?: (string | number) | GetQuery,
  backend?: string,
): MoldDeleteState<T> {
  const {mold, instanceId, state: moldState} = moldComposition<T>(
    context,
    {
      backend,
      set,
      action: 'delete',
      query: (typeof idOrQuery === 'string' || typeof idOrQuery === 'number')
        ? { id: idOrQuery }
        : idOrQuery,
    }
  );

  const state: MoldDeleteState<T> = moldState as any;

  state.delete = () => mold.start(instanceId);

  return state;
}
