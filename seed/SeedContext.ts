import {MoldSeedContext} from './interfaces/MoldSeedContext';
import {DbAdapter} from '../interfaces/DbAdapter';


export class SeedContext implements MoldSeedContext {
  private readonly adapter: DbAdapter;
  private actions: (() => void)[] = [];


  constructor(adapter: DbAdapter) {
    this.adapter = adapter;
  }

  destroy() {
    delete this.actions;
  }


  insert(set: string, docs: Record<string, any>[]) {

  }

}
