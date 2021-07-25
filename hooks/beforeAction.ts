import {MoldHook, PreHookDefinition} from '../transform/interfaces/MoldHook'
import {makeHooksDefinitions} from '../transform/transformHelpers'


/**
 * Call specified hooks before starting of request
 * Position of hook is certainly that which is in the set.
 * @param action - call specified hook only at this action like find, get etc
 * @param hook - hook itself
 */
export function beforeAction(
  action: string,
  hook: MoldHook | MoldHook[]
): PreHookDefinition[] {
  if (!hook) throw new Error(`Please set almost one hook`)

  return makeHooksDefinitions('before', hook, [action])
}
