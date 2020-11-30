import {MoldHook, PreHookDefinition} from '../transform/interfaces/MoldHook';
import {makeHooksDefinitions} from '../transform/hookHelpers';
import {ALL_ACTIONS} from '../shared/constants';


/**
 * It will be called before request time and in all the actions branches.
 * Position of hook is certainly that which is in the set.
 * @param hook - one or several hooks
 * @param onlyActions - actions to use for this hooks. All if doesn't set.
 */
export function beforeAll(
  hook: MoldHook | MoldHook[],
  onlyActions: string[] = [ALL_ACTIONS]
): PreHookDefinition[] {
  if (!hook) throw new Error(`Please set almost one hook`);

  return makeHooksDefinitions('before', hook, onlyActions);
}
