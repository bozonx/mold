import MoldSet from './interfaces/MoldSet';
import {MoldMiddleware} from './interfaces/MoldMiddleware';
import {SpecialSet} from './interfaces/SpecialSet';
import {MoldError} from '../interfaces/MoldError';
import HookContext from './interfaces/HookContext';


export default class MoldHooks {
  private sets: {[index: string]: MoldSet};


  constructor(sets: {[index: string]: MoldSet}) {
    this.sets = sets;
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
