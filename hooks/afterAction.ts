import {MoldHook, PreHookDefinition} from '../transform/interfaces/MoldHook';
import {makeHooksDefinitions} from '../transform/transformHelpers';


/**
 * Position of hook is certainly that which is in the set.
 */
export function afterAction(
  action: string,
  hook: MoldHook | MoldHook[]
): PreHookDefinition[] {
  if (!hook) throw new Error(`Please set almost one hook`)

  return makeHooksDefinitions('after', hook, [action])
}
