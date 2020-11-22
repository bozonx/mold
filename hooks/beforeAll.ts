import {MoldHook, PreHookDefinition, SetItem} from '../hooksMidleware/interfaces/MoldHook';
import {ALL_ACTIONS} from '../hooksMidleware/constants';


function handleActions(hook: MoldHook, onlyActions?: string[]): PreHookDefinition[] {
  if (!onlyActions) return [{
    type: 'before',
    action: ALL_ACTIONS,
    hook,
  }];

  const result: PreHookDefinition[] = [];

  for (let actionName of onlyActions) {
    result.push({
      type: 'before',
      action: actionName,
      hook,
    });
  }

  return result;
}

function handlePreHookDefinition(
  preHook: MoldHook | PreHookDefinition,
  onlyActions?: string[]
): PreHookDefinition[] {
  if (typeof preHook === 'function') {
    // hook
    return handleActions(preHook, onlyActions);
  }
  else {
    // hook definition
    return handleActions(preHook.hook, onlyActions);
  }
}


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
        ...handlePreHookDefinition(item, onlyActions),
      ]
    }

    return result;
  }
  else {
    return handlePreHookDefinition(hook, onlyActions);
  }
}
