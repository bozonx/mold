import {MoldHook, SetItem} from '../transform/interfaces/MoldHook';
import {makeHooksDefinitions} from '../transform/hookHelpers';


/**
 * It will be called before request time and in all the actions branches.
 * Position of hook is certainly that which is in the set.
 * @param hook - one or several hooks
 * @param includeActions - actions to use for this hooks
 * @param excludeActions - use all the actions exclude specified
 */
export function beforeAll(
  hook: MoldHook | MoldHook[] | SetItem,
  includeActions?: string[],
  excludeActions?: string[]
): SetItem {
  if (!hook) throw new Error(`Please set almost one hook`);

  return makeHooksDefinitions('before', hook, includeActions, excludeActions);
}
