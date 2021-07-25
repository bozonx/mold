import {MoldHook, PreHookDefinition} from '../transform/interfaces/MoldHook'
import {makeHooksDefinitions} from '../transform/transformHelpers'
import {ALL_ACTIONS} from '../shared/constants'


/**
 * Call specified hooks after request has done and after all the actions
 * or after all the specified actions.
 * Position of hook is certainly that which is in the set.
 * @param hook - hook itself
 * @param onlyActions - actions to use for this hooks. All if doesn't set.
 */
export function afterAll(
  hook: MoldHook | MoldHook[],
  onlyActions: string[] = [ALL_ACTIONS]
): PreHookDefinition[] {
  if (!hook) throw new Error(`Please set almost one hook`)

  return makeHooksDefinitions('after', hook, onlyActions)
}
