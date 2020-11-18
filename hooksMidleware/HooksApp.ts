import MoldRequest from '../interfaces/MoldRequest';
import MoldHooks from './MoldHooks';


export default class HooksApp {
  private moldHooks: MoldHooks;


  constructor(moldHooks: MoldHooks) {
    this.moldHooks = moldHooks;
  }


  /**
   * Make some request which will be processed with its own hooks.
   */
  request(set: string, request: MoldRequest): Promise<void> {
    return this.moldHooks.request(request);
  }

}
