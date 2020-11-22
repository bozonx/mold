import {PreHookDefinition} from '../hooksMidleware/interfaces/PreHookDefinition';
import {MoldHook} from '../hooksMidleware/interfaces/MoldHook';
import {ALL_ACTIONS} from '../hooksMidleware/constants';


/**
 * Position of hook is certainly that which is in the set.
 */
export default function afterAll(hook: MoldHook | MoldHook[], onlyActions?: string[]): PreHookDefinition {
  return {
    type: 'after',
    action: (onlyActions) ? onlyActions : ALL_ACTIONS,
    hook,
  };
}
