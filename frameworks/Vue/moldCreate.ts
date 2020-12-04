import {SetupContext} from '@vue/composition-api';

import {ActionState} from '../../frontend/interfaces/ActionState';
import {saveComposition} from './composition/saveComposition';
import {JsonTypes} from '../../interfaces/Types';


interface MoldCreateState<T> extends ActionState<T> {
  create: (data: Record<string, any>) => void;
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

  state.create = (data: Record<string, any>) => mold.start(instanceId, data);

  return state;
}
