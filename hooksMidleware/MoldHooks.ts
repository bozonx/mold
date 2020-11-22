import {SPECIAL_HOOKS, SpecialSet} from './interfaces/SpecialSet';
import {GlobalContext, HookContext} from './interfaces/HookContext';
import {MoldResponse} from '../interfaces/MoldResponse';
import MoldRequest from '../interfaces/MoldRequest';
import {MoldError} from './MoldError';
import {REQUEST_STATUSES} from '../frontend/constants';
import {cloneDeepObject} from '../helpers/objects';
import HooksApp from './HooksApp';
import {MoldHook, PreHookDefinition, SetsDefinition, SetsDefinitionItem} from './interfaces/MoldHook';
import {HookType} from './interfaces/HookType';
import {MoldErrorDefinition} from '../interfaces/MoldErrorDefinition';


// TODO: better to use immutable for context, request and response


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
  private sets: Sets;
  private readonly requestFunc: HooksRequestFunc;
  private readonly app: HooksApp;


  constructor(rawSets: SetsDefinition, requestFunc: HooksRequestFunc) {
    this.sets = this.prepareSets(rawSets);
    this.requestFunc = requestFunc;
    this.app = new HooksApp(this);
  }

  destroy() {
    // @ts-ignore
    delete this.sets;
    this.app.destroy();
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
      this.validateRequest(request);
      await this.startSpecialHooks('beforeHooks', globalContext);
      await this.startBeforeHooks(globalContext);
      await this.startSpecialHooks('beforeRequest', globalContext);
      await this.startRequest(globalContext);
      await this.startSpecialHooks('afterRequest', globalContext);
      await this.startAfterHooks(globalContext);
      await this.startSpecialHooks('afterHooks', globalContext);
    }
    catch (e) {
      globalContext.error = this.parseError(e);

      try {
        await this.startSpecialHooks('error', globalContext);
      }
      catch (e) {
        globalContext.error = this.parseError(e);
      }
    }
    // return response success or error
    return this.makeResponse(globalContext);
  }


  private async startRequest(globalContext: GlobalContext) {
    const request = cloneDeepObject(globalContext.request) as MoldRequest;

    globalContext.response = cloneDeepObject(await this.requestFunc(request)) as any;
  }

  private async startBeforeHooks(globalContext: GlobalContext) {
    const {set, action} = globalContext.request;
    // do nothing because there arent action's hooks
    if (!this.sets.setsBefore[set][action]) return;

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
    if (!this.sets.setsAfter[set][action]) return;

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
    if (!this.sets[specialSet]) return;

    for (let hook of this.sets[specialSet]) {
      const hookContext = this.makeHookContext('special', globalContext);
      // error will be handled at the upper level
      await hook(hookContext);
      // save all the transformed context elements
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

  private validateRequest(request: MoldRequest) {
    if (request.set) {
      throw new Error(`Set isn't specified int the request`);
    }
    else if (request.action) {
      throw new Error(`Action isn't specified int the request of set "${request.set}"`);
    }
    else if (SPECIAL_HOOKS.includes(request.set)) {
      throw new Error(`Unappropriated set name "${request.set}"`);
    }
    else if (!this.sets.setsBefore[request.set] || !this.sets.setsAfter[request.set]) {
      throw new Error(`Can't find set "${request.set}"`);
    }
  }

  private parseError(e: MoldError | Error): MoldErrorDefinition {
    // if standard error
    if (e instanceof MoldError) {
      return e.toPlainObject();
    }
    else {
      return {
        code: REQUEST_STATUSES.fatalError,
        message: String(e),
      }
    }
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
      this.parseSetHooks(setName, rawSets[setName], sets)
    }

    return sets;
  }

  private parseSetHooks(setName: string, hooks: SetsDefinitionItem[], sets: Sets) {
    for (let item of hooks) {
      if (Array.isArray(item)) {
        // parse recursive
        this.parseSetHooks(setName, item, sets);

        continue;
      }

      const hookDefinition: PreHookDefinition = item;
      const root = (hookDefinition.type === 'before') ? 'setsBefore' : 'setsAfter';

      // TODO: what about "all"??? или это лучше сделать за счет мета-хуков??
      // TODO: надо all делать тут так как мета-хук не знает какие есть action

      // TODO: ??? запретить чтобы вложенные хуки были с разными action

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
   * Error means only request handling error not error status in response.
   * @param globalContext
   * @private
   */
  private makeResponse(globalContext: GlobalContext): MoldResponse {
    if (globalContext.error) {
      return {
        status: globalContext.error.code,
        success: false,
        errors: [globalContext.error],
        result: null,
      }
    }
    else if (!globalContext.response) {
      return {
        status: REQUEST_STATUSES.fatalError,
        success: false,
        errors: [{code: REQUEST_STATUSES.fatalError, message: 'No response'}],
        result: null,
      };
    }

    return globalContext.response;
  }

}
