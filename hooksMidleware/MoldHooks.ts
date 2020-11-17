import {SpecialSet} from './interfaces/SpecialSet';
import {MoldError} from '../interfaces/MoldError';
import {HookContext} from './interfaces/HookContext';
import {HookDefinition} from './interfaces/HookDefinition';


interface Sets {
  beforeHooks: HookDefinition[];
  beforeRequest: HookDefinition[];
  afterRequest: HookDefinition[];
  afterHooks: HookDefinition[];
  error: HookDefinition[];
  // all other sets
  [index: string]: HookDefinition[];
}


export default class MoldHooks {
  private readonly sets: Sets;


  constructor(rawSets: {[index: string]: HookDefinition}) {
    this.sets = this.sortHooks(rawSets);
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
    // TODO: add
    for (let hook of this.sets[context.set]) {
      await hook.hook(context);
    }
  }

  private async startRequest(context: HookContext) {
    // TODO: add
  }

  private async startAfterHooks(context: HookContext) {
    // TODO: add
  }

  private async startSpecialHooks(specialSet: SpecialSet, context: HookContext) {
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
