import {cloneDeepObject, omitObj} from 'squidlet-lib/src/objects'
import {SpecialSet} from './interfaces/SpecialSet'
import {GlobalContext, HookContext} from './interfaces/HookContext'
import {MoldResponse} from '../interfaces/MoldResponse'
import {MoldRequest} from '../interfaces/MoldRequest'
import ContextApp from './ContextApp'
import {SetsDefinition} from './interfaces/MoldHook'
import {Sets} from './interfaces/Sets'
import {MoldDocument} from '../interfaces/MoldDocument'
import {prepareSets, validateRequest, validateResponse} from './transformHelpers'
import {AllHookTypes} from './interfaces/HookType'


/**
 * External request func.
 * On fatal error it throws a new Error(message). And then cycle will be interrupted.
 */
export type HooksRequestFunc = (request: MoldRequest) => Promise<MoldResponse>


export default class MoldTransform {
  private sets: Sets
  private requestFunc!: HooksRequestFunc


  constructor(rawSets: SetsDefinition) {
    this.sets = prepareSets(rawSets)

  }

  destroy() {
    // @ts-ignore
    delete this.sets
  }


  /**
   * Register request function immediately after creating the instance.
   * @param requestFunc
   */
  registerRequest(requestFunc: HooksRequestFunc) {
    this.requestFunc = requestFunc
  }

  /**
   * Pass request to the specified "requestFunc" though hooks transformation.
   * Promise is positive, errors of remote side returns as ordinary success response
   * but with errors field, rejecting of the promise is able only on fatal error.
   * @param request
   * @param user - authorized user data if exist
   * @return fully transformed response.
   */
  async request(request: MoldRequest, user?: MoldDocument): Promise<MoldResponse> {
    validateRequest(request)

    const contextApp = new ContextApp(this, user)
    const globalContext: GlobalContext = this.makeGlobalContext(request, contextApp)

    await this.startSpecialHooks('beforeHooks', globalContext)
    await this.startBeforeHooks(globalContext)
    await this.startSpecialHooks('beforeRequest', globalContext)
    await this.startRequest(globalContext)
    // TODO: тут уже нельзя модифицировать  globalContext.request
    await this.startSpecialHooks('afterRequest', globalContext)
    await this.startAfterHooks(globalContext)
    // TODO: тут уже нельзя модифицировать  globalContext.request
    await this.startSpecialHooks('afterHooks', globalContext)

    contextApp.destroy()
    // return response
    return cloneDeepObject<MoldResponse>(globalContext.response)
  }


  private async startRequest(globalContext: GlobalContext) {
    const request = cloneDeepObject<MoldRequest>(globalContext.request)
    const rawResponse: MoldResponse = await this.requestFunc(request)

    validateResponse(rawResponse)

    globalContext.response = cloneDeepObject<MoldResponse>({
      ...rawResponse,
      errors: (typeof rawResponse.errors === 'undefined') ? null : rawResponse.errors,
      result: (typeof rawResponse.result === 'undefined') ? null : rawResponse.result,
    })
  }

  private async startBeforeHooks(globalContext: GlobalContext) {
    const {set, action} = globalContext.request

    for (let hook of this.sets.setsBefore[set]?.[action] || []) {
      const hookContext = this.makeHookContext('before', globalContext)
      // error will be handled at the upper level
      await hook(hookContext)
      // save transformed request and shared
      globalContext.request = hookContext.request
      globalContext.shared = hookContext.shared
    }
  }

  private async startAfterHooks(globalContext: GlobalContext) {
    const {set, action} = globalContext.request;

    for (let hook of this.sets.setsAfter[set]?.[action] || []) {
      const hookContext = this.makeHookContext('after', globalContext)
      // error will be handled at the upper level
      await hook(hookContext)
      // save transformed response and shared
      globalContext.response = hookContext.response
      globalContext.shared = hookContext.shared
    }
  }

  private async startSpecialHooks(specialSet: SpecialSet, globalContext: GlobalContext) {
    for (let hook of this.sets[specialSet] || []) {
      const hookContext = this.makeHookContext('special', globalContext)
      // error will be handled at the upper level
      await hook(hookContext)
      // save all the transformed context elements
      globalContext.request = hookContext.request
      globalContext.response = hookContext.response
      globalContext.shared = hookContext.shared
    }
  }

  private makeGlobalContext(request: MoldRequest, contextApp: ContextApp): GlobalContext {
    return {
      app: contextApp,
      request,
      response: undefined,
      shared: {},
    }
  }

  private makeHookContext(type: AllHookTypes, globalContext: GlobalContext): HookContext {
    return {
      type,
      ...cloneDeepObject<GlobalContext>(omitObj(globalContext, 'app')),
      app: globalContext.app,
    }
  }

}
