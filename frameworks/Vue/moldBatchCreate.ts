import {SetupContext} from '@vue/composition-api';

import {ActionState} from '../../frontend/interfaces/ActionState';
import {saveComposition} from './composition/saveComposition';
import {JsonTypes} from '../../interfaces/Types';
import {MoldDocument} from '../../interfaces/MoldDocument';


interface MoldBatchCreateState<T> extends ActionState<T> {
  create: (docs: Partial<MoldDocument>[]) => void;
}


export default function moldBatchCreate<T>(
  context: SetupContext,
  set: string,
  query?: Record<string, JsonTypes>,
  backend?: string
): MoldBatchCreateState<T> {
  const {mold, instanceId, state: moldState} = saveComposition<T>(context, {
    backend,
    set,
    action: 'batchCreate',
    query,
  });

  const state: MoldBatchCreateState<T> = moldState as any;

  state.create = (docs: Partial<MoldDocument>[]) => mold.start(instanceId, docs);

  return state;
}
