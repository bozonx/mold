import {PreHookDefinition} from '../hooksMidleware/interfaces/HookDefinition';
import {MoldHook} from '../hooksMidleware/interfaces/MoldHooks';
import {ALL_ACTIONS} from '../hooksMidleware/constants';


/**
 * Position of hook is certainly that which is in the set.
 */
export default function beforeAction(action: string, hook: MoldHook | MoldHook[]): PreHookDefinition {
  return {
    type: 'before',
    action: action,
    hook,
  };
}
