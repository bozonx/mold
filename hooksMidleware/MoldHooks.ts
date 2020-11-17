import {SpecialSet} from './interfaces/SpecialSet';
import {MoldError} from '../interfaces/MoldError';
import {HookContext} from './interfaces/HookContext';
import {HookDefinition} from './interfaces/HookDefinition';
import BackendResponse from '../interfaces/BackendResponse';
import MoldRequest from '../interfaces/MoldRequest';


interface Sets {
  beforeHooks: HookDefinition[];
  beforeRequest: HookDefinition[];
  afterRequest: HookDefinition[];
  afterHooks: HookDefinition[];
  error: HookDefinition[];
  after: {[index: string]: HookDefinition[]};
  before: {[index: string]: HookDefinition[]};
}

export type HooksRequestFunc = (request: MoldRequest) => Promise<BackendResponse>;


export default class MoldHooks {
  private readonly sets: Sets;
  private readonly requestFunc: HooksRequestFunc;


  constructor(rawSets: {[index: string]: HookDefinition}, requestFunc: HooksRequestFunc) {
    this.sets = this.sortHooks(rawSets);
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
      const error: MoldError = e;

      // TODO: pass error. Может в context добавить
      await this.startSpecialHooks('error', context);
    }
  }


  private async startBeforeHooks(context: HookContext) {
    for (let hook of this.sets.before[context.set]) {
      // TODO: поидее нужно обновлять контекст чтобы его не перезаписывали случайно
      await hook.hook(context);
    }
  }

  private async startRequest(context: HookContext) {
    const response = await this.requestFunc(context.request);

    context.response = response;
  }

  private async startAfterHooks(context: HookContext) {
    for (let hook of this.sets.after[context.set]) {
      // TODO: поидее нужно обновлять контекст чтобы его не перезаписывали случайно
      await hook.hook(context);
    }
  }

  private async startSpecialHooks(specialSet: SpecialSet, context: HookContext) {
    // TODO: поидее нужно обновлять контекст чтобы его не перезаписывали случайно
    // TODO: add
  }

  private makeContext(): HookContext {
    // TODO: add
  }

  private sortHooks(rawSets: {[index: string]: HookDefinition}): Sets {
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
