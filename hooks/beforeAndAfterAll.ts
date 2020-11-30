import {MoldHook, PreHookDefinition} from '../transform/interfaces/MoldHook';
import {makeHooksDefinitions} from '../transform/hookHelpers';
import {ALL_ACTIONS} from '../shared/constants';


/**
 * Position of hook is certainly that which is in the set.
 */
export function beforeAndAfterAll(
  hook: MoldHook | MoldHook[],
  onlyActions: string[] = [ALL_ACTIONS]
): PreHookDefinition[] {
  if (!hook) throw new Error(`Please set almost one hook`);

  return [
    ...makeHooksDefinitions('before', hook, onlyActions),
    ...makeHooksDefinitions('after', hook, onlyActions),
  ];
}
