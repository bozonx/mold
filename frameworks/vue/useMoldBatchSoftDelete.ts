import {inject} from 'vue'
import {InstanceState, moldComposition} from './composition/moldComposition'
import {JsonTypes} from '../../interfaces/Types'
import {MoldDocument} from '../../interfaces/MoldDocument'
import Mold from '../../frontend/Mold'
import {VUE_CONTEXT_NAME} from './constants'


interface MoldBatchSoftDeleteState<T> extends InstanceState<T> {
  delete: (ids: (string | number)[], queryOverride?: Record<string, any>) => void
}


export default function useMoldBatchSoftDelete<T>(
  set: string,
  query?: Record<string, JsonTypes>,
  backend?: string,
  deletedPropName: string = 'deleted'
): MoldBatchSoftDeleteState<T> {
  const mold = inject<Mold>(VUE_CONTEXT_NAME)

  if (!mold) throw new Error(`Can't get mold from app context`)

  const state = moldComposition<T>({
    backend,
    set,
    action: 'batchPatch',
    query,
  }) as MoldBatchSoftDeleteState<T>

  state.delete = (ids: (string | number)[]) => {
    const docs: MoldDocument[] = ids.map((id) => {
      return { id, [deletedPropName]: true }
    });

    mold.start(state.$instanceId, docs)
  }

  return state
}
