import {inject} from 'vue'
import {InstanceState, moldComposition} from './composition/moldComposition'
import {GetQuery} from '../../interfaces/GetQuery'
import {MoldDocument} from '../../interfaces/MoldDocument'
import Mold from '../../frontend/Mold'
import {VUE_CONTEXT_NAME} from './constants'


interface MoldSaveState<T> extends InstanceState<T> {
  save: (data: Record<string, any>, queryOverride?: Record<string, any>) => void;
}


export default function useMoldSave<T>(
  set: string,
  idOrQuery?: (string | number) | GetQuery,
  backend?: string
): MoldSaveState<T> {
  const mold = inject<Mold>(VUE_CONTEXT_NAME)

  if (!mold) throw new Error(`Can't get mold from app context`)

  const query: GetQuery | undefined = (typeof idOrQuery === 'string' || typeof idOrQuery === 'number')
    ? { id: idOrQuery }
    : idOrQuery
  const actionName = (typeof query?.id === 'string' || typeof query?.id === 'number')
    ? 'patch'
    : 'create'
  const state = moldComposition<T>({
    backend,
    set,
    action: actionName,
    query,
  }) as MoldSaveState<T>

  state.save = (data: Partial<MoldDocument>) => {
    mold.start(state.$instanceId, data)
  }

  return state
}
