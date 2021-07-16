import {MoldDocument} from './MoldDocument'


export interface MoldSeedContext {
  insert(set: string, docs: MoldDocument[])
}
