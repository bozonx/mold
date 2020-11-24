import {MoldSeedContext} from '../interfaces/MoldSeedContext';
import {DbAdapter} from '../interfaces/DbAdapter';


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

      throw new Error(result.errors?.map(
        (item) => `${item.code}: ${item.message}`
      ).join(', ') || `Unknown error`);
    });
  }

  async startActions() {
    for (let cb of this.actions) {
      await cb();
    }
  }

}
