import {SetupContext} from '@vue/composition-api';

import {ActionState} from '../../frontend/interfaces/ActionState';
import {saveComposition} from './composition/saveComposition';
import {JsonTypes} from '../../interfaces/Types';
import {MoldDocument} from '../../interfaces/MoldDocument';


interface MoldBatchPatchState<T> extends ActionState<T> {
  patch: (docs: MoldDocument[]) => void;
}


export default function moldBatchPatch<T>(
  context: SetupContext,
  set: string,
  query?: Record<string, JsonTypes>,
  backend?: string
): MoldBatchPatchState<T> {
  const {mold, instanceId, state: moldState} = saveComposition<T>(context, {
    backend,
    set,
    action: 'batchPatch',
    query,
  });

  const state: MoldBatchPatchState<T> = moldState as any;

  state.patch = (docs: MoldDocument[]) => mold.start(instanceId, docs);

  return state;
}
