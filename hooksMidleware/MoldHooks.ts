import {SpecialSet} from './interfaces/SpecialSet';
import {GlobalContext, HookContext} from './interfaces/HookContext';
import {SetsDefinition} from './interfaces/PreHookDefinition';
import {MoldResponse} from '../interfaces/MoldResponse';
import MoldRequest from '../interfaces/MoldRequest';
import {MoldError} from './MoldError';
import {REQUEST_STATUSES} from '../frontend/constants';
import {cloneDeepObject} from '../helpers/objects';
import HooksApp from './HooksApp';
import {MoldHook} from './interfaces/MoldHooks';
import {PROHIBITED_SET_NAMES} from './constants';
import {HookType} from './interfaces/HookType';
import {MoldErrorDefinition} from '../interfaces/MoldErrorDefinition';


interface Sets {
  // special sets
  beforeHooks: MoldHook[];
  beforeRequest: MoldHook[];
  afterRequest: MoldHook[];
  afterHooks: MoldHook[];
  error: MoldHook[];
  // set which will be called before request
  // like { setName: { actionName: [ ...hookCb() ] } }
  setsAfter: {[index: string]: {[index: string]: MoldHook[]}};
  // set which will be called after request
  setsBefore: {[index: string]: {[index: string]: MoldHook[]}};
}
// External request func.
// on error it has to throw a new MoldError(code, message).
export type HooksRequestFunc = (request: MoldRequest) => Promise<MoldResponse>;


export default class MoldHooks {
  private readonly sets: Sets;
  private readonly requestFunc: HooksRequestFunc;
  private readonly app: HooksApp;


  constructor(rawSets: SetsDefinition, requestFunc: HooksRequestFunc) {
    this.sets = this.prepareSets(rawSets);
    this.requestFunc = requestFunc;
    this.app = new HooksApp(this);
  }

  destroy() {
    // TODO: add
  }


  /**
   * Do request to the backend though hooks transformation.
   * Promise is only positive, on error it will return error-like response.
   * @param request
   * @return fully transformed response.
   */
  async request(request: MoldRequest): Promise<MoldResponse> {
    try {
      this.validateRequest(request);
    }
    catch (e) {
      const error: MoldError = e;

      return {
        status: error.code,
        success: false,
        errors: [error.toPlainObject()],
        result: null,
      }
    }

    const globalContext: GlobalContext = this.makeGlobalContext(request);
    // try to go to the end of transformation.
    // but if there an error occurred then start special error hooks branch.
    try {
      await this.startSpecialHooks('beforeHooks', globalContext);
      await this.startBeforeHooks(globalContext);
      await this.startSpecialHooks('beforeRequest', globalContext);
      await this.startRequest(globalContext);
      await this.startSpecialHooks('afterRequest', globalContext);
      await this.startAfterHooks(globalContext);
      await this.startSpecialHooks('afterHooks', globalContext);
    }
    catch (e) {
      await this.handleRequestError(globalContext, e);
    }
    // return response success or error
    return this.makeResponse(globalContext);
  }


  private async startBeforeHooks(globalContext: GlobalContext) {
    const actionHooks = this.sets.setsBefore[globalContext.request.set][globalContext.request.action];
    // do nothing because there arent action's hooks
    if (!actionHooks) return;

    for (let hook of actionHooks) {
      const hookContext = this.makeHookContext('before', globalContext);

      await hook(hookContext);

      globalContext.request = hookContext.request;
      globalContext.shared = hookContext.shared;
    }
  }

  private async startRequest(globalContext: GlobalContext) {
    const request = cloneDeepObject(globalContext.request) as MoldRequest;

    globalContext.response = await this.requestFunc(request);
  }

  private async startAfterHooks(globalContext: GlobalContext) {
    const actionHooks = this.sets.setsAfter[globalContext.request.set][globalContext.request.action];
    // do nothing because there arent action's hooks
    if (!actionHooks) return;

    for (let hook of actionHooks) {
      const hookContext = this.makeHookContext('after', globalContext);

      await hook(hookContext);

      globalContext.response = hookContext.response;
      globalContext.shared = hookContext.shared;
    }
  }

  private async startSpecialHooks(specialSet: SpecialSet, globalContext: GlobalContext) {
    const actionHooks = this.sets[specialSet];
    // do nothing because there arent any hooks
    if (!actionHooks) return;

    for (let hook of actionHooks) {
      const hookContext = this.makeHookContext('special', globalContext);

      await hook(hookContext);

      globalContext.request = hookContext.request;
      globalContext.response = hookContext.response;
      globalContext.shared = hookContext.shared;
      globalContext.error = hookContext.error;
    }
  }

  private makeGlobalContext(request: MoldRequest): GlobalContext {
    return {
      request,
      response: undefined,
      error: undefined,
      shared: {},
    }
  }

  private makeHookContext(type: HookType, globalContext: GlobalContext): HookContext {
    return {
      app: this.app,
      type,
      ...cloneDeepObject(globalContext) as GlobalContext,
    };
  }

  /**
   * Sort and normalize hooks
   * @param rawSets is { setName: [[type, hookCb]] } or { specialSet: [...] }
   * @private
   */
  private prepareSets(rawSets: SetsDefinition): Sets {
    const sets: Sets = {
      beforeHooks: [],
      beforeRequest: [],
      afterRequest: [],
      afterHooks: [],
      error: [],
      setsAfter: {},
      setsBefore: {},
    };


    // TODO: рассортировать хуки по порядку вызова

    return sets;
  }
  private validateRequest(request: MoldRequest) {
    if (PROHIBITED_SET_NAMES.includes(request.set)) {
      // TODO: error-like response
      throw new MoldError(
        REQUEST_STATUSES.fatalError,
        `Unappropriated set name "${request.set}"`
      );
    }
    else if (!this.sets.setsBefore[request.set]) {
      // TODO: error-like response
      throw new MoldError(
        REQUEST_STATUSES.fatalError,
        `Can't find before hooks of set "${request.set}"`
      );
    }
    else if (!this.sets.setsAfter[request.set]) {
      // TODO: error-like response
      throw new MoldError(
        REQUEST_STATUSES.fatalError,
        `Can't find after hooks of set "${request.set}"`
      );
    }
  }

  private async handleRequestError(globalContext: GlobalContext, e: MoldError | Error) {
    let error: MoldErrorDefinition;
    // if standard error
    if (typeof e !== 'object' || typeof e.code !== 'number') {
      error = {
        code: REQUEST_STATUSES.fatalError,
        message: String(e),
      }
    }
    else {
      error = (e as MoldError).toPlainObject();
    }

    globalContext.error = error;

    await this.startSpecialHooks('error', globalContext);
  }

  private makeResponse(globalContext: GlobalContext): MoldResponse {
    // TODO: do it
  }

}
