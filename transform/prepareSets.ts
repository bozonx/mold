import {PreHookDefinition, SetItem, SetsDefinition} from './interfaces/MoldHook';
import {SPECIAL_HOOKS} from './interfaces/SpecialSet';
import {Sets} from './interfaces/Sets';


function parseSetHooks(setName: string, hooks: SetItem[], sets: Sets) {
  for (let item of hooks) {
    if (Array.isArray(item)) {
      // parse recursive
      parseSetHooks(setName, item, sets);

      continue;
    }

    const hookDefinition: PreHookDefinition = item;
    const root = (hookDefinition.type === 'before') ? 'setsBefore' : 'setsAfter';

    // TODO: what about "all"??? или это лучше сделать за счет мета-хуков??
    // TODO: надо all делать тут так как мета-хук не знает какие есть action

    // TODO: ??? запретить чтобы вложенные хуки были с разными action и type

    if (!sets[root][setName]) {
      sets[root][setName] = {};
    }

    if (!sets[root][setName][hookDefinition.action]) {
      sets[root][setName][hookDefinition.action] = [];
    }

    sets[root][setName][hookDefinition.action].push(hookDefinition.hook);
  }

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
      sets[setName] = [
        ...sets[setName],
        ...rawSets[setName],
      ];

      continue;
    }
    // else this is user-defined set
    parseSetHooks(setName, rawSets[setName], sets)
  }

  return sets;
}
