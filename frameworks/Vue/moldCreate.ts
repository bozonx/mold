import {SetupContext} from '@vue/composition-api';

import {ActionState} from '../../frontend/interfaces/ActionState';
import {saveComposition} from './composition/saveComposition';
import {JsonTypes} from '../../interfaces/Types';
import {MoldDocument} from '../../interfaces/MoldDocument';


interface MoldCreateState<T> extends ActionState<T> {
  create: (data: Partial<MoldDocument>) => void;
}


export default function moldCreate<T>(
  context: SetupContext,
  set: string,
  query?: Record<string, JsonTypes>,
  backend?: string
): MoldCreateState<T> {
  const {mold, instanceId, state: moldState} = saveComposition<T>(context, {
    backend,
    set,
    action: 'create',
    query,
  });

  const state: MoldCreateState<T> = moldState as any;

  state.create = (data: Partial<MoldDocument>) => mold.start(instanceId, data);

  return state;
}
