import {MoldHook, PreHookDefinition, SetItem} from '../hooksMidleware/interfaces/MoldHook';
import {handlePreHookDefinition} from '../helpers/hookHelpers';


/**
 * It will be called before request time and in all the actions branch.
 * Position of hook is certainly that which is in the set.
 * @param hook - one or several hooks
 * @param onlyActions - actions to use for this hooks
 */
export default function beforeAll(
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
