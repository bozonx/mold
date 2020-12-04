import {SetupContext} from '@vue/composition-api';

import {ActionState} from '../../frontend/interfaces/ActionState';
import {moldComposition} from './composition/MoldComposition';
import {JsonTypes} from '../../interfaces/Types';


interface MoldBatchDeleteState<T> extends ActionState<T> {
  delete: (ids: (string | number)[]) => void;
}


export default function moldBatchDelete<T>(
  context: SetupContext,
  set: string,
  query?: Record<string, JsonTypes>,
  backend?: string
): MoldBatchDeleteState<T> {
  const {mold, instanceId, state: moldState} = moldComposition<T>(context, {
    backend,
    set,
    action: 'batchDelete',
    query,
  });

  const state: MoldBatchDeleteState<T> = moldState as any;

  state.delete = (ids: (string | number)[]) => mold.start(instanceId, ids);

  return state;
}
