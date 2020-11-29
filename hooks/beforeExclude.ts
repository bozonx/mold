import {MoldHook, PreHookDefinition} from '../transform/interfaces/MoldHook';
import {makeHooksDefinitions} from '../transform/hookHelpers';


/**
 * Position of hook is certainly that which is in the set.
 */
export function beforeExclude(
  hook: MoldHook | MoldHook[],
  excludeActions: string[]
): PreHookDefinition[] {
  if (!hook) throw new Error(`Please set almost one hook`);

  return makeHooksDefinitions('before', hook, undefined, excludeActions);
}
