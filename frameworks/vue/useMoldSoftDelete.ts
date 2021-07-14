import {inject} from 'vue'
import {InstanceState, moldComposition} from './composition/moldComposition'
import {GetQuery} from '../../interfaces/GetQuery';
import Mold from '../../frontend/Mold'
import {VUE_CONTEXT_NAME} from './constants'


interface MoldSoftDeleteState<T> extends InstanceState<T> {
  delete: (queryOverride?: Record<string, any>) => void
}


export default function useMoldSoftDelete<T>(
  set: string,
  idOrQuery?: (string | number) | GetQuery,
  backend?: string,
  deletedPropName: string = 'deleted'
): MoldSoftDeleteState<T> {
  const mold = inject<Mold>(VUE_CONTEXT_NAME)

  if (!mold) throw new Error(`Can't get mold from app context`)

  const state = moldComposition<T>({
    backend,
    set,
    action: 'patch',
    query: (typeof idOrQuery === 'string' || typeof idOrQuery === 'number')
      ? { id: idOrQuery }
      : idOrQuery,
  }) as MoldSoftDeleteState<T>

  state.delete = () => {
    mold.start(state.$instanceId, {[deletedPropName]: true})
  }

  return state
}
