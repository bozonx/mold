import {SetupContext} from '@vue/composition-api';

import {ActionState} from '../../frontend/interfaces/ActionState';
import {saveComposition} from './composition/saveComposition';
import {JsonTypes} from '../../interfaces/Types';
import {MoldDocument} from '../../interfaces/MoldDocument';


interface MoldBatchSoftDeleteState<T> extends ActionState<T> {
  delete: (ids: (string | number)[]) => void;
}


export default function moldBatchSoftDelete<T>(
  context: SetupContext,
  set: string,
  query?: Record<string, JsonTypes>,
  backend?: string,
  deletedPropName: string = 'deleted'
): MoldBatchSoftDeleteState<T> {
  const {mold, instanceId, state: moldState} = saveComposition<T>(context, {
    backend,
    set,
    action: 'batchPatch',
    query,
  });

  const state: MoldBatchSoftDeleteState<T> = moldState as any;

  state.delete = (ids: (string | number)[]) => {
    const docs: MoldDocument[] = ids.map((id) => {
      return { id, [deletedPropName]: true };
    });

    mold.start(instanceId, docs);
  }

  return state;
}
