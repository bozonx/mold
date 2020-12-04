import {SetupContext} from '@vue/composition-api';

import {moldComposition} from './composition/MoldComposition';
import {ActionState} from '../../frontend/interfaces/ActionState';
import {GetQuery} from '../../interfaces/GetQuery';


interface MoldSoftDeleteState<T> extends ActionState<T> {
  delete: () => void;
}


export default function moldSoftDelete<T>(
  context: SetupContext,
  set: string,
  idOrQuery?: (string | number) | GetQuery,
  backend?: string,
  deletedPropName: string = 'deleted'
): MoldSoftDeleteState<T> {
  const {mold, instanceId, state: moldState} = moldComposition<T>(
    context,
    {
      backend,
      set,
      action: 'patch',
      query: (typeof idOrQuery === 'string' || typeof idOrQuery === 'number')
        ? { id: idOrQuery }
        : idOrQuery,
    }
  );

  const state: MoldSoftDeleteState<T> = moldState as any;

  state.delete = () => mold.start(instanceId, {[deletedPropName]: true});

  return state;
}
