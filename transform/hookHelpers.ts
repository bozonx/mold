import {MoldHook, PreHookDefinition} from './interfaces/MoldHook';
import {ALL_ACTIONS} from '../shared/constants';
import {MoldRequest} from '../interfaces/MoldRequest';
import {SPECIAL_HOOKS} from './interfaces/SpecialSet';
import {MoldResponse} from '../interfaces/MoldResponse';
import {BaseHookTypes} from './interfaces/HookType';
import {combineWhiteAndBlackLists} from '../helpers/common';
import {HOOK_CRUD_ACTIONS} from './interfaces/HookCrudActions';


export function handleActions(
  type: BaseHookTypes,
  hook: MoldHook,
  includeActions: string[] = []
): PreHookDefinition[] {
  // TODO: зачем так ??? может all указывать в самом beforeAll
  if (!includeActions.length && !excludeCrudActions.length) {
    // if no white or black lists then it is for all the actions.
    return [{
      type,
      action: ALL_ACTIONS,
      hook,
    }];
  }

  const actionList = combineWhiteAndBlackLists(
    HOOK_CRUD_ACTIONS,
    includeActions,
    excludeCrudActions
  );

  return actionList.map((action) => {
    return {
      type,
      action,
      hook,
    };
  });
}

export function makeHooksDefinitions(
  type: BaseHookTypes,
  hook: MoldHook | MoldHook[],
  includeActions?: string[]
): PreHookDefinition[] {
  if (Array.isArray(hook)) {
    let result: PreHookDefinition[] = [];

    for (let hookItem of hook) {
      result = [
        ...result,
        ...handleActions(type, hookItem, includeActions),
      ]
    }

    return result;
  }

  return handleActions(type, hook, includeActions);
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
