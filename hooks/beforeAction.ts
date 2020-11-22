import {MoldHook} from '../hooksMidleware/interfaces/MoldHook';
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
