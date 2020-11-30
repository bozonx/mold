import {MoldHook, PreHookDefinition} from '../transform/interfaces/MoldHook';
import {makeHooksDefinitions} from '../transform/transformHelpers';
import {HOOK_CRUD_ACTIONS} from '../transform/interfaces/HookCrudActions';
import {filterBlackList} from '../helpers/common';


/**
 * Position of hook is certainly that which is in the set.
 * @param hook
 * @param excludeCrudActions - if doesn't set then all the CRUD actions will be used.
 */
export function afterCrud(
  hook: MoldHook | MoldHook[],
  excludeCrudActions?: string[]
): PreHookDefinition[] {
  if (!hook) throw new Error(`Please set almost one hook`);

  const whiteList: string[] = filterBlackList(HOOK_CRUD_ACTIONS, excludeCrudActions);

  return makeHooksDefinitions('after', hook, whiteList);
}
