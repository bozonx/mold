import {MoldHook, PreHookDefinition} from '../hooksMidleware/interfaces/MoldHook';
import {ALL_ACTIONS} from '../hooksMidleware/constants';
import {HookType} from '../hooksMidleware/interfaces/HookType';


export function handleActions(
  type: HookType,
  hook: MoldHook,
  onlyActions?: string[]
): PreHookDefinition[] {
  if (!onlyActions) return [{
    type,
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

export function handlePreHookDefinition(
  type: HookType,
  preHook: MoldHook | PreHookDefinition,
  onlyActions?: string[]
): PreHookDefinition[] {
  if (typeof preHook === 'function') {
    // hook
    return handleActions(type, preHook, onlyActions);
  }
  else {
    // hook definition
    return handleActions(type, preHook.hook, onlyActions);
  }
}
