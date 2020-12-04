import {SetupContext} from '@vue/composition-api';

import {saveComposition} from './composition/saveComposition';
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
  const {mold, instanceId, state: moldState} = saveComposition<T>(
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
