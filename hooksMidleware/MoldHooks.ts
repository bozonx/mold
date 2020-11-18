import {SpecialSet} from './interfaces/SpecialSet';
import {HookContext} from './interfaces/HookContext';
import {HookDefinition, PreHookDefinition} from './interfaces/HookDefinition';
import BackendResponse from '../interfaces/BackendResponse';
import MoldRequest from '../interfaces/MoldRequest';
import {MoldError} from './MoldError';
import {REQUEST_STATUSES} from '../frontend/constants';
import {cloneDeepObject} from '../helpers/objects';


interface Sets {
  beforeHooks: HookDefinition[];
  beforeRequest: HookDefinition[];
  afterRequest: HookDefinition[];
  afterHooks: HookDefinition[];
  error: HookDefinition[];
  after: {[index: string]: HookDefinition[]};
  before: {[index: string]: HookDefinition[]};
}
// on error it has to throw a MoldError
export type HooksRequestFunc = (request: MoldRequest) => Promise<BackendResponse>;


export default class MoldHooks {
  private readonly sets: Sets;
  private readonly requestFunc: HooksRequestFunc;


  constructor(rawSets: {[index: string]: PreHookDefinition[]}, requestFunc: HooksRequestFunc) {
    this.sets = this.prepareHooks(rawSets);
    this.requestFunc = requestFunc;
  }

  destroy() {
    // TODO: add
  }


  async start() {
    const context: HookContext = this.makeContext();

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


  private async startBeforeHooks(globalContext: HookContext) {
    for (let hook of this.sets.before[globalContext.set]) {

      // TODO: выполнять конкретный action!!!!

      const localContext = cloneDeepObject(globalContext) as HookContext;

      await hook.hook(localContext);

      globalContext.request = localContext.request;
      globalContext.shared = localContext.shared;
    }
  }

  private async startRequest(globalContext: HookContext) {
    const request = cloneDeepObject(globalContext.request) as MoldRequest;

    globalContext.response = await this.requestFunc(request);
  }

  private async startAfterHooks(globalContext: HookContext) {
    for (let hook of this.sets.after[globalContext.set]) {
      const localContext = cloneDeepObject(globalContext) as HookContext;

      await hook.hook(localContext);

      globalContext.response = localContext.response;
      globalContext.shared = localContext.shared;
    }
  }

  private async startSpecialHooks(specialSet: SpecialSet, context: HookContext) {
    // TODO: поидее нужно обновлять контекст чтобы его не перезаписывали случайно
    // TODO: add
  }

  private makeContext(): HookContext {
    // TODO: add
  }

  private mergeContext(
    globalContext: HookContext,
    localContext: Partial<HookContext>
  ): HookContext {
    return cloneDeepObject({
      ...globalContext,
      ...localContext,
    }) as HookContext;
  }

  /**
   * Sort and normalize hooks
   * @param rawSets is { setName: [[type, hookCb]] } or { specialSet: [...] }
   * @private
   */
  private prepareHooks(rawSets: {[index: string]: PreHookDefinition[]}): Sets {
    // TODO: рассортировать хуки по порядку вызова
  }





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
