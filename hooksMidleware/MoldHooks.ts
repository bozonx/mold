import MoldSet from './interfaces/MoldSet';
import {MoldMiddleware} from './interfaces/MoldMiddleware';


export default class MoldHooks {
  constructor(sets: {[index: string]: MoldSet}) {
  }


  middleware(): MoldMiddleware {

  }


  getEntity(entityName: string): MoldSet {
    // TODO: add
  }

  makeEntity(entityName: string, params, hooks) {
    // TODO: add
  }

}
