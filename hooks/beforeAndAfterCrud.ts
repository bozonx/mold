import {filterBlackList} from 'squidlet-lib/src/arrays'
import {MoldHook, PreHookDefinition} from '../transform/interfaces/MoldHook'
import {makeHooksDefinitions} from '../transform/transformHelpers'
import {HOOK_CRUD_ACTIONS} from '../transform/interfaces/HookCrudActions'


/**
 * Call hooks before and after request and only at CRUD actions branches
 * Position of hook is certainly that which is in the set.
 * @param hook
 * @param excludeCrudActions - if doesn't set then all the CRUD actions will be used.
 */
export function beforeAndAfterCrud(
  hook: MoldHook | MoldHook[],
  excludeCrudActions?: string[]
): PreHookDefinition[] {
  if (!hook) throw new Error(`Please set almost one hook`)

  const whiteList: string[] = filterBlackList(HOOK_CRUD_ACTIONS, excludeCrudActions)

  return [
    ...makeHooksDefinitions('before', hook, whiteList),
    ...makeHooksDefinitions('after', hook, whiteList),
  ]
}
