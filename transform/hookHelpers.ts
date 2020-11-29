import {MoldHook, PreHookDefinition} from './interfaces/MoldHook';
import {ALL_ACTIONS} from '../shared/constants';
import {MoldRequest} from '../interfaces/MoldRequest';
import {SPECIAL_HOOKS} from './interfaces/SpecialSet';
import {MoldResponse} from '../interfaces/MoldResponse';
import {BaseHookTypes} from './interfaces/HookType';


export function handleActions(
  type: HookType,
  hook: MoldHook,
  onlyActions?: string[]
): PreHookDefinition[] {
  // TODO: review
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
  includeActions?: string[],
  excludeActions?: string[]
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

export function makeHooksDefinitions(
  type: BaseHookTypes,
  hook: MoldHook | MoldHook[],
  includeActions?: string[],
  excludeActions?: string[]
): PreHookDefinition[] {
  if (Array.isArray(hook)) {
    let result: PreHookDefinition[] = [];

    for (let item of hook) {
      result = [
        ...result,
        ...handlePreHookDefinition('before', item, includeActions, excludeActions),
      ]
    }

    return result;
  }
  else {
    return [handlePreHookDefinition('before', hook, includeActions, excludeActions)];
  }
}

export function validateRequest(request: MoldRequest) {
  if (!request.set) {
    throw new Error(`Set isn't specified int the request`);
  }
  else if (!request.action) {
    throw new Error(`Action isn't specified int the request of set "${request.set}"`);
  }
  else if (SPECIAL_HOOKS.includes(request.set)) {
    throw new Error(`Unappropriated set name "${request.set}"`);
  }
}

export function validateResponse(response: MoldResponse) {
  if (typeof response.status !== 'number') {
    throw new Error(`Incorrect type of "status" of response`);
  }
  else if (typeof response.success !== 'boolean') {
    throw new Error(`Incorrect type of "success" of response`);
  }
  else if (response.errors && !Array.isArray(response.errors)) {
    throw new Error(`Incorrect type of "errors" of response`);
  }
}
