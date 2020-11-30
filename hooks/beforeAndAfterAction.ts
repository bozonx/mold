import {MoldHook, PreHookDefinition} from '../transform/interfaces/MoldHook';
import {makeHooksDefinitions} from '../transform/hookHelpers';


/**
 * Position of hook is certainly that which is in the set.
 */
export function beforeAndAfterAction(
  action: string,
  hook: MoldHook | MoldHook[]
): PreHookDefinition[] {
  if (!hook) throw new Error(`Please set almost one hook`);

  return [
    ...makeHooksDefinitions('before', hook, [action]),
    ...makeHooksDefinitions('after', hook, [action]),
  ];
}
