import MoldBackendEntityBase from './MoldBackendEntityBase';
import {MoldHook} from '../interfaces/MoldHooks';


export default class MoldBackend {
  constructor(entitiesHooks: MoldHook[]) {
  }


  getEntity(entityName: string): MoldBackendEntityBase {
    // TODO: add
  }

  makeEntity(entityName: string, params, hooks) {
    // TODO: add
  }

}
