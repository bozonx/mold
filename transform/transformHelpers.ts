import {cloneDeepObject, omitObj} from 'squidlet-lib/src/objects'
import {MoldHook, PreHookDefinition, SetsDefinition} from './interfaces/MoldHook'
import {MoldRequest} from '../interfaces/MoldRequest'
import {MoldResponse} from '../interfaces/MoldResponse'
import {AllHookTypes, BaseHookTypes} from './interfaces/HookType'
import {SPECIAL_HOOKS} from './interfaces/SpecialSet'
import {Sets} from './interfaces/Sets'
import ContextApp from './ContextApp'
import {GlobalContext, HookContext} from './interfaces/HookContext'
import {ALL_ACTIONS} from '../shared/constants'


export function makeGlobalContext(request: MoldRequest, contextApp: ContextApp): GlobalContext {
  return {
    app: contextApp,
    request,
    response: undefined,
    shared: {},
  }
}

export function makeHookContext(type: AllHookTypes, globalContext: GlobalContext): HookContext {
  return {
    type,
    ...cloneDeepObject<GlobalContext>(omitObj(globalContext, 'app')),
    app: globalContext.app,
  }
}

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
    }
  })
}

export function makeHooksDefinitions(
  type: BaseHookTypes,
  hook: MoldHook | MoldHook[],
  includeActions: string[] = []
): PreHookDefinition[] {
  if (Array.isArray(hook)) {
    let result: PreHookDefinition[] = []

    for (let hookItem of hook) {
      result = [
        ...result,
        ...handleActions(type, hookItem, includeActions),
      ]
    }

    return result
  }

  return handleActions(type, hook, includeActions)
}


export function validateRequest(request: MoldRequest) {
  if (!request.set) {
    throw new Error(`Set isn't specified int the request`)
  }
  else if (typeof request.set !== 'string') {
    throw new Error(`Set isn't string`)
  }
  else if (!request.action) {
    throw new Error(`Action isn't specified int the request of set "${request.set}"`)
  }
  else if (typeof request.action !== 'string') {
    throw new Error(`Action isn't string`)
  }
  else if (SPECIAL_HOOKS.includes(request.set)) {
    throw new Error(`Unappropriated set name "${request.set}"`)
  }
  // TODO: check query and data
}

export function validateResponse(response: MoldResponse) {
  // TODO: review
  if (typeof response.status !== 'number') {
    throw new Error(`Incorrect type of "status" of response`)
  }
  else if (typeof response.success !== 'boolean') {
    throw new Error(`Incorrect type of "success" of response`)
  }
  else if (response.errors && !Array.isArray(response.errors)) {
    throw new Error(`Incorrect type of "errors" of response`)
  }
}


export function parseBeforeAfterHooks(definitions: PreHookDefinition[][]): [Record<string, MoldHook[]>, Record<string, MoldHook[]>] {
  const actionsBefore: Record<string, MoldHook[]> = {}
  const actionsAfter: Record<string, MoldHook[]> = {}
  const allActions: MoldHook[] = []

  for (let item of definitions) {
    for (let hookDefinition of item) {
      if (typeof hookDefinition !== 'object') throw new Error(`Incorrect hook definition`)

      if (hookDefinition.action === ALL_ACTIONS) {
        // TODO: надо разделять before и after, либо сделать обертку с проверкой
        allActions.push(hookDefinition.hook)
        // TODO: закинуть во все существующие actions

        continue
      }
      // else just ordinary action
      const actionsByType = (hookDefinition.type === 'before') ? actionsBefore : actionsAfter

      if (actionsByType[hookDefinition.action]) {
        actionsByType[hookDefinition.action].push(hookDefinition.hook)
      }
      else {
        // TODO: сначала вставляем все allActions
      }
    }
  }

  return [actionsBefore, actionsAfter]
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
  }

  for (let setName of Object.keys(rawSets)) {
    if (SPECIAL_HOOKS.includes(setName)) {
      // add to special hooks
      sets[setName] = [
        ...sets[setName],
        ...rawSets[setName],
      ]

      continue
    }
    // else this is user-defined set
    const [actionsBefore, actionsAfter] = parseBeforeAfterHooks(rawSets[setName])

    sets.setsBefore[setName] = actionsBefore
    sets.setsAfter[setName] = actionsAfter
  }

  return sets
}
