import {SpecialSet} from './interfaces/SpecialSet';
import {GlobalContext, HookContext} from './interfaces/HookContext';
import {MoldResponse} from '../interfaces/MoldResponse';
import {MoldRequest} from '../interfaces/MoldRequest';
import {cloneDeepObject} from '../helpers/objects';
import ContextApp from './ContextApp';
import {SetsDefinition} from './interfaces/MoldHook';
import {HookType} from './interfaces/HookType';
import {Sets} from './interfaces/Sets';
import {prepareSets} from './prepareSets';
import {REQUEST_STATUSES} from '../shared/constants';
import {MoldDocument} from '../interfaces/MoldDocument';
import {validateRequest, validateResponse} from './hookHelpers';


// External request func.
// on fatal error it has to throw a new Error(message).
// And then cycle will be interrupted and fatalError special branch will be started.
export type HooksRequestFunc = (request: MoldRequest) => Promise<MoldResponse>;


export default class MoldHooks {
  private sets: Sets;
  private readonly requestFunc: HooksRequestFunc;
  private readonly contextApp: ContextApp;


  constructor(
    rawSets: SetsDefinition,
    requestFunc: HooksRequestFunc,
    user?: MoldDocument
  ) {
    this.sets = prepareSets(rawSets);
    this.requestFunc = requestFunc;
    this.contextApp = new ContextApp(this, user);
  }

  destroy() {
    // @ts-ignore
    delete this.sets;
    this.contextApp.destroy();
  }


  /**
   * Do request to the backend though hooks transformation.
   * Promise is only positive, reject will never be called.
   * On error it will return error-like response.
   * @param request
   * @return fully transformed response.
   */
  async request(request: MoldRequest): Promise<MoldResponse> {
    const globalContext: GlobalContext = this.makeGlobalContext(request);
    // Try to go to the end of transformation.
    // But if there is an error occurred then start special error hooks branch.
    // This error branch only for errors which was occurred while handling a request.
    // Error which backend sent back doesn't matter - it means success request.
    try {
      validateRequest(request);
      await this.startSpecialHooks('beforeHooks', globalContext);
      await this.startBeforeHooks(globalContext);
      await this.startSpecialHooks('beforeRequest', globalContext);
      await this.startRequest(globalContext);
      await this.startSpecialHooks('afterRequest', globalContext);
      await this.startAfterHooks(globalContext);
      await this.startSpecialHooks('afterHooks', globalContext);
    }
    catch (e) {
      globalContext.fatalError = String(e);

      try {
        await this.startSpecialHooks('fatalError', globalContext);
      }
      catch (e) {
        globalContext.fatalError = String(e);
      }
    }

    // return response success or error
    return this.makeResponse(globalContext);
  }


  private async startRequest(globalContext: GlobalContext) {
    const request = cloneDeepObject(globalContext.request) as MoldRequest;
    const rawResponse: MoldResponse = await this.requestFunc(request);

    validateResponse(rawResponse);

    globalContext.response = cloneDeepObject({
      ...rawResponse,
      errors: (typeof rawResponse.errors === 'undefined') ? null : rawResponse.errors,
      result: (typeof rawResponse.result === 'undefined') ? null : rawResponse.result,
    }) as MoldResponse;
  }

  private async startBeforeHooks(globalContext: GlobalContext) {
    const {set, action} = globalContext.request;
    // do nothing because there arent action's hooks
    if (!this.sets.setsBefore[set]?.[action]) return;

    for (let hook of this.sets.setsBefore[set][action]) {
      const hookContext = this.makeHookContext('before', globalContext);
      // error will be handled at the upper level
      await hook(hookContext);
      // save transformed request and shared
      globalContext.request = hookContext.request;
      globalContext.shared = hookContext.shared;
    }
  }

  private async startAfterHooks(globalContext: GlobalContext) {
    const {set, action} = globalContext.request;
    // do nothing because there arent action's hooks
    if (!this.sets.setsAfter[set]?.[action]) return;

    for (let hook of this.sets.setsAfter[set][action]) {
      const hookContext = this.makeHookContext('after', globalContext);
      // error will be handled at the upper level
      await hook(hookContext);
      // save transformed response and shared
      globalContext.response = hookContext.response;
      globalContext.shared = hookContext.shared;
    }
  }

  private async startSpecialHooks(specialSet: SpecialSet, globalContext: GlobalContext) {
    // do nothing because there arent any hooks
    if (!this.sets[specialSet] || !this.sets[specialSet].length) return;

    for (let hook of this.sets[specialSet]) {
      const hookContext = this.makeHookContext('special', globalContext);
      // error will be handled at the upper level
      await hook(hookContext);
      // save all the transformed context elements
      globalContext.request = hookContext.request;
      globalContext.response = hookContext.response;
      globalContext.shared = hookContext.shared;
      globalContext.fatalError = hookContext.fatalError;
    }
  }

  private makeGlobalContext(request: MoldRequest): GlobalContext {
    return {
      request,
      response: undefined,
      shared: {},
      fatalError: undefined,
    }
  }

  private makeHookContext(type: HookType, globalContext: GlobalContext): HookContext {
    return {
      app: this.contextApp,
      type,
      ...cloneDeepObject(globalContext) as GlobalContext,
    };
  }

  private makeResponse(globalContext: GlobalContext): MoldResponse {
    if (globalContext.fatalError) {
      // Error means only request handling fatal error not error status in response.
      return {
        status: REQUEST_STATUSES.fatalError,
        success: false,
        errors: [{code: REQUEST_STATUSES.fatalError, message: globalContext.fatalError}],
        result: null,
      }
    }
    else if (!globalContext.response) {
      // something wrong - no response
      return {
        status: REQUEST_STATUSES.fatalError,
        success: false,
        errors: [{code: REQUEST_STATUSES.fatalError, message: 'No response'}],
        result: null,
      };
    }

    return cloneDeepObject(globalContext.response) as MoldResponse;
  }

}
