import {MoldHook} from '../hooksMidleware/interfaces/MoldHook';
import {ALL_ACTIONS} from '../hooksMidleware/constants';


/**
 * Position of hook is certainly that which is in the set.
 */
export function afterAction(action: string, hook: MoldHook | MoldHook[]): PreHookDefinition {
  return {
    type: 'after',
    action: action,
    hook,
  };
}
