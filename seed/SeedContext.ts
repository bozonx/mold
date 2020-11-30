import {MoldSeedContext} from '../interfaces/MoldSeedContext';
import {DbAdapter} from '../interfaces/DbAdapter';
import {stringifyMoldError} from '../helpers/common';


export class SeedContext implements MoldSeedContext {
  private readonly adapter: DbAdapter;
  private actions: (() => void)[] = [];


  constructor(adapter: DbAdapter) {
    this.adapter = adapter;
  }

  destroy() {
    this.actions = [];
  }


  insert(set: string, docs: Record<string, any>[]) {
    this.actions.push(async () => {
      const result = await this.adapter.batchCreate(set, docs);

      if (result.success) return result;

      // TODO: оно вообще так будет ???
      throw new Error(stringifyMoldError(result.errors));
    });
  }

  async startActions() {
    for (let cb of this.actions) {
      await cb();
    }
  }

}
