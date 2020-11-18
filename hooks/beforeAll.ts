import {PreHookDefinition} from '../hooksMidleware/interfaces/PreHookDefinition';
import {MoldHook} from '../hooksMidleware/interfaces/MoldHooks';
import {ALL_ACTIONS} from '../hooksMidleware/constants';


/**
 * It will be called at before request time and in all the actions branch.
 * Position of hook is certainly that which is in the set.
 */
export default function beforeAll(hook: MoldHook | MoldHook[], onlyActions?: string[]): PreHookDefinition {
  return {
    type: 'before',
    action: (onlyActions) ? onlyActions : ALL_ACTIONS,
    hook,
  };
}
