import {MoldHook, PreHookDefinition, SetsDefinition} from './interfaces/MoldHook';
import {MoldRequest} from '../interfaces/MoldRequest';
import {MoldResponse} from '../interfaces/MoldResponse';
import {BaseHookTypes} from './interfaces/HookType';
import {SPECIAL_HOOKS} from './interfaces/SpecialSet';
import {Sets} from './interfaces/Sets';


export function handleActions(
  type: BaseHookTypes,
  hook: MoldHook,
  includeActions: string[]
): PreHookDefinition[] {
  return includeActions.map((action) => {
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
  includeActions: string[] = []
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


export function parseSetHooks(
  setName: string,
  definitions: PreHookDefinition[][]
): Pick<Sets, 'setsAfter'> & Pick<Sets, 'setsBefore'> {
  // TODO: неправильно !!!
  const result = {
    setsAfter: {},
    setsBefore: {},
  }

  for (let item of definitions) {
    for (let hookDefinition of item) {
      if (typeof hookDefinition !== 'object') throw new Error(`Incorrect hook definition`);

      const root = (hookDefinition.type === 'before') ? 'setsBefore' : 'setsAfter';

      // TODO: надо all делать тут так как мета-хук не знает какие есть action
      //       чтобы добавить во все actions надо сначала их создать

      // create set if it doesn't exists
      if (!result[root][setName]) {
        result[root][setName] = {};
      }
      // create action if it doesn't exists
      if (!result[root][setName][hookDefinition.action]) {
        result[root][setName][hookDefinition.action] = [];
      }

      result[root][setName][hookDefinition.action].push(hookDefinition.hook);
    }
  }

  return result;
}

/**
 * Sort and normalize hooks
 * @param rawSets is { setName: [[type, hookCb]] } or { specialSet: [...] }
 */
export function prepareSets(rawSets: SetsDefinition): Sets {
  const sets: Sets = {
    beforeHooks: [],
    beforeRequest: [],
    afterRequest: [],
    afterHooks: [],
    setsBefore: {},
    setsAfter: {},
  };

  for (let setName of Object.keys(rawSets)) {
    if (SPECIAL_HOOKS.includes(setName)) {
      // add to special hooks
      sets[setName] = [
        ...sets[setName],
        ...rawSets[setName],
      ];

      continue;
    }
    // else this is user-defined set
    const {setsBefore, setsAfter} = parseSetHooks(setName, rawSets[setName]);

    sets.setsBefore = {
      ...sets.setsBefore,
      ...setsBefore,
    };
    sets.setsAfter = {
      ...sets.setsAfter,
      ...setsAfter,
    };
  }

  return sets;
}
