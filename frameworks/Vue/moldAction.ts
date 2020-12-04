import {SetupContext} from '@vue/composition-api';

import {ActionState} from '../../frontend/interfaces/ActionState';
import {moldComposition} from './composition/moldComposition';


interface MoldActionState<T> extends ActionState<T> {
  start: (data?: Record<string, any>) => void;
}


export default function moldAction<T>(
  context: SetupContext,
  set: string,
  actionName: string,
  query?: Record<string, any>,
  backend?: string
): MoldActionState<T> {
  const {mold, instanceId, state: moldState} = moldComposition<T>(context, {
    backend,
    set,
    action: actionName,
    query,
  });

  const state: MoldActionState<T> = moldState as any;

  state.start = (data?: Record<string, any>) => mold.start(instanceId, data);

  return state;
}
