import {MoldHook, PreHookDefinition, SetItem} from '../transform/interfaces/MoldHook';
import {handlePreHookDefinition} from '../transform/hookHelpers';


/**
 * Position of hook is certainly that which is in the set.
 */
export function beforeAction(
  action: string,
  hook: MoldHook | MoldHook[] | SetItem
): SetItem {
  if (!hook) throw new Error(`Please set almost one hook`);

  if (Array.isArray(hook)) {
    let result: PreHookDefinition[] = [];

    for (let item of hook) {
      result = [
        ...result,
        ...handlePreHookDefinition('before', item, [action]),
      ]
    }

    return result;
  }
  else {
    return handlePreHookDefinition('before', hook, [action]);
  }
}
