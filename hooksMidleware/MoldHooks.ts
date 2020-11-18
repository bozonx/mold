import {SpecialSet} from './interfaces/SpecialSet';
import {GlobalContext, HookContext} from './interfaces/HookContext';
import {PreHookDefinition} from './interfaces/PreHookDefinition';
import BackendResponse from '../interfaces/BackendResponse';
import MoldRequest from '../interfaces/MoldRequest';
import {MoldError} from './MoldError';
import {REQUEST_STATUSES} from '../frontend/constants';
import {cloneDeepObject} from '../helpers/objects';
import HooksApp from './HooksApp';
import {MoldHook} from './interfaces/MoldHooks';


interface Sets {
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
// on error it has to throw a new MoldError(code, message)
export type HooksRequestFunc = (request: MoldRequest) => Promise<BackendResponse>;


export default class MoldHooks {
  private readonly sets: Sets;
  private readonly requestFunc: HooksRequestFunc;
  private readonly app: HooksApp;


  constructor(rawSets: {[index: string]: PreHookDefinition[]}, requestFunc: HooksRequestFunc) {
    this.sets = this.prepareSets(rawSets);
    this.requestFunc = requestFunc;
    this.app = new HooksApp(this);
  }

  destroy() {
    // TODO: add
  }


  async request(request: MoldRequest) {
    const context: GlobalContext = this.makeGlobalContext(request);

    try {
      await this.startSpecialHooks('beforeHooks', context);
      await this.startBeforeHooks(context);
      await this.startSpecialHooks('beforeRequest', context);
      await this.startRequest(context);
      await this.startSpecialHooks('afterRequest', context);
      await this.startAfterHooks(context);
      await this.startSpecialHooks('afterHooks', context);
    }
    catch (e) {
      let error: MoldError = e;

      if (typeof e !== 'object' || typeof e.code !== 'number') {
        error = {
          code: REQUEST_STATUSES.fatalError,
          message: String(e),
        }
      }

      // TODO: поидее нужно обновлять контекст чтобы его не перезаписывали случайно
      context.error = error;

      await this.startSpecialHooks('error', context);
    }
  }


  private async startBeforeHooks(globalContext: GlobalContext) {
    if (!this.sets.setsBefore[globalContext.request.set]) {
      throw new MoldError(
        REQUEST_STATUSES.fatalError,
        `Can't find hooks of set "${globalContext.request.set}"`
      );
    }
    else if (!this.sets.setsBefore[globalContext.request.set][globalContext.request.action]) {
      throw new MoldError(
        REQUEST_STATUSES.fatalError,
        `Can't find hooks of action "${globalContext.request.action}"`
      );
    }

    const actionHooks = this.sets.setsBefore[globalContext.request.set][globalContext.request.action];

    for (let hook of this.sets.setsBefore[globalContext.set]) {

      // TODO: выполнять конкретный action!!!!
      // TODO: app не надо клонировать

      const localContext = cloneDeepObject(globalContext) as HookContext;

      await hook.hook(localContext);

      globalContext.request = localContext.request;
      globalContext.shared = localContext.shared;
    }
  }

  private async startRequest(globalContext: GlobalContext) {
    const request = cloneDeepObject(globalContext.request) as MoldRequest;

    globalContext.response = await this.requestFunc(request);
  }

  private async startAfterHooks(globalContext: GlobalContext) {
    for (let hook of this.sets.after[globalContext.set]) {
      const localContext = cloneDeepObject(globalContext) as HookContext;

      await hook.hook(localContext);

      globalContext.response = localContext.response;
      globalContext.shared = localContext.shared;
    }
  }

  private async startSpecialHooks(specialSet: SpecialSet, context: GlobalContext) {
    // TODO: поидее нужно обновлять контекст чтобы его не перезаписывали случайно
    // TODO: add
  }

  private makeGlobalContext(request: MoldRequest): GlobalContext {
    return {
      app: this.app,
      request,
      response: undefined,
      error: undefined,
      shared: {},
    }
  }

  private makeActionContext(globalContext: GlobalContext): HookContext {

  }

  /**
   * Sort and normalize hooks
   * @param rawSets is { setName: [[type, hookCb]] } or { specialSet: [...] }
   * @private
   */
  private prepareSets(rawSets: {[index: string]: PreHookDefinition[]}): Sets {
    // TODO: рассортировать хуки по порядку вызова
  }





  // private mergeContext(
  //   globalContext: HookContext,
  //   localContext: Partial<HookContext>
  // ): HookContext {
  //   return cloneDeepObject({
  //     ...globalContext,
  //     ...localContext,
  //   }) as HookContext;
  // }

  // middleware(): MoldMiddleware {
  //
  // }
  //
  //
  // getEntity(entityName: string): MoldSet {
  //   // TODO: add
  // }
  //
  // makeEntity(entityName: string, params, hooks) {
  //   // TODO: add
  // }

}
