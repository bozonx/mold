import {MoldHook, PreHookDefinition} from '../transform/interfaces/MoldHook';
import {makeHooksDefinitions} from '../transform/hookHelpers';


/**
 * It will be called before request time and in all the actions branches.
 * Position of hook is certainly that which is in the set.
 * @param hook - one or several hooks
 * @param includeActions - actions to use for this hooks
 * @param excludeCrudActions - use all the CRUD actions but exclude specified
 */
export function beforeAll(
  hook: MoldHook | MoldHook[],
  includeActions?: string[],
  excludeCrudActions?: string[]
): PreHookDefinition[] {
  if (!hook) throw new Error(`Please set almost one hook`);

  return makeHooksDefinitions('before', hook, includeActions, excludeCrudActions);
}
