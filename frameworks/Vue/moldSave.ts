import {SetupContext} from '@vue/composition-api';

import {moldComposition} from './composition/MoldComposition';
import {GetQuery} from '../../interfaces/GetQuery';
import {MoldDocument} from '../../interfaces/MoldDocument';
import {ActionState} from '../../frontend/interfaces/ActionState';


interface MoldSaveState<T> extends ActionState<T> {
  save: (data: Record<string, any>) => void;
}


export default function moldSave<T>(
  context: SetupContext,
  set: string,
  idOrQuery?: (string | number) | GetQuery,
  backend?: string
): MoldSaveState<T> {
  const query: GetQuery | undefined = (typeof idOrQuery === 'string' || typeof idOrQuery === 'number')
    ? { id: idOrQuery }
    : idOrQuery;
  const actionName = (typeof query?.id === 'string' || typeof query?.id === 'number')
    ? 'patch'
    : 'create';
  const {mold, instanceId, state: moldState} = moldComposition<T>(context, {
    backend,
    set,
    action: actionName,
    query,
  });

  const state: MoldSaveState<T> = moldState as any;

  state.save = (data: Partial<MoldDocument>) => mold.start(instanceId, data);

  return state;
}
