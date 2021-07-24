import {cloneDeepObject} from 'squidlet-lib/src/objects'
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


export default class MoldRequestTransform {
  private sets: Sets
  private readonly requestFunc: HooksRequestFunc
  private readonly contextApp: ContextApp


  constructor(
    // TODO: rename to transforms??
    rawSets: SetsDefinition,
    // TODO: лучше отдельно регистрировать в отдельном методе
    requestFunc: HooksRequestFunc,
    // TODO: зачем он нужен???
    user?: MoldDocument
  ) {
    this.sets = prepareSets(rawSets)
    this.requestFunc = requestFunc
    this.contextApp = new ContextApp(this, user)
  }

  destroy() {
    // @ts-ignore
    delete this.sets
    this.contextApp.destroy()
  }


  /**
   * Do request to the backend though hooks transformation.
   * Promise is positive, reject is only on fatal error.
   * Try to go to the end of transformation.
   * But if there is a fatal error occurred then execution will be interrupted and
   * error will be risen.
   * Error which backend sent back doesn't matter - it means success request.
   * On error it will return error-like response.
   * Actions don't matter for transform.
   * There isn't specific processing for certain actions.
   * @param request
   * @return fully transformed response.
   */
  async request(request: MoldRequest): Promise<MoldResponse> {
    validateRequest(request)

    // TODO: reveiw doc - должно вернуть выбросить ошибку на fatal

    const globalContext: GlobalContext = this.makeGlobalContext(request)

    await this.startSpecialHooks('beforeHooks', globalContext)
    await this.startBeforeHooks(globalContext)
    await this.startSpecialHooks('beforeRequest', globalContext)
    await this.startRequest(globalContext)
    // TODO: тут уже нельзя модифицировать  globalContext.request
    await this.startSpecialHooks('afterRequest', globalContext)
    await this.startAfterHooks(globalContext)
    // TODO: тут уже нельзя модифицировать  globalContext.request
    await this.startSpecialHooks('afterHooks', globalContext)
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

  private makeGlobalContext(request: MoldRequest): GlobalContext {
    return {
      request,
      response: undefined,
      shared: {},
    }
  }

  private makeHookContext(type: AllHookTypes, globalContext: GlobalContext): HookContext {
    return {
      app: this.contextApp,
      type,
      ...cloneDeepObject<GlobalContext>(globalContext),
    }
  }

}
