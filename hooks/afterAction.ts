import {PreHookDefinition} from '../hooksMidleware/interfaces/PreHookDefinition';
import {MoldHook} from '../hooksMidleware/interfaces/MoldHooks';
import {ALL_ACTIONS} from '../hooksMidleware/constants';


/**
 * Position of hook is certainly that which is in the set.
 */
export default function afterAction(action: string, hook: MoldHook | MoldHook[]): PreHookDefinition {
  return {
    type: 'after',
    action: action,
    hook,
  };
}