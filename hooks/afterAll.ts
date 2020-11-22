import {MoldHook, PreHookDefinition, SetItem} from '../hooksMidleware/interfaces/MoldHook';
import {handlePreHookDefinition} from '../hooksMidleware/hookHelpers';


/**
 * Position of hook is certainly that which is in the set.
 */
export function afterAll(
  hook: MoldHook | MoldHook[] | SetItem,
  onlyActions?: string[]
): SetItem {
  if (!hook) throw new Error(`Please set almost one hook`);

  if (Array.isArray(hook)) {
    let result: PreHookDefinition[] = [];

    for (let item of hook) {
      result = [
        ...result,
        ...handlePreHookDefinition('after', item, onlyActions),
      ]
    }

    return result;
  }
  else {
    return handlePreHookDefinition('after', hook, onlyActions);
  }
}
