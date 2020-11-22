import {MoldHook, PreHookDefinition, SetItem} from '../hooksMidleware/interfaces/MoldHook';
import {ALL_ACTIONS} from '../hooksMidleware/constants';
import {handlePreHookDefinition} from '../helpers/hookHelpers';


/**
 * Position of hook is certainly that which is in the set.
 */
export function beforeAndAfterAll(
  hook: MoldHook | MoldHook[] | SetItem,
  onlyActions?: string[]
): SetItem {
  if (!hook) throw new Error(`Please set almost one hook`);

  if (Array.isArray(hook)) {
    let result: PreHookDefinition[] = [];

    for (let item of hook) {
      result = [
        ...result,
        ...handlePreHookDefinition('before', item, onlyActions),
      ]
    }

    return result;
  }
  else {
    return handlePreHookDefinition('before', hook, onlyActions);
  }
}
