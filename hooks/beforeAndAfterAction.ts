import {MoldHook, PreHookDefinition} from '../transform/interfaces/MoldHook'
import {makeHooksDefinitions} from '../transform/transformHelpers'


/**
 * Call hooks before and after request on specified action
 * Position of hook is certainly that which is in the set.
 */
export function beforeAndAfterAction(
  action: string,
  hook: MoldHook | MoldHook[]
): PreHookDefinition[] {
  if (!hook) throw new Error(`Please set almost one hook`)

  return [
    ...makeHooksDefinitions('before', hook, [action]),
    ...makeHooksDefinitions('after', hook, [action]),
  ]
}
