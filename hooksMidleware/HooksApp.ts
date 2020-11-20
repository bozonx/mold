import MoldRequest from '../interfaces/MoldRequest';
import MoldHooks from './MoldHooks';
import {MoldResponse} from '../interfaces/MoldResponse';


export default class HooksApp {
  private moldHooks: MoldHooks;


  constructor(moldHooks: MoldHooks) {
    this.moldHooks = moldHooks;
  }


  /**
   * Make some request which will be processed with its own hooks.
   */
  request(set: string, request: MoldRequest): Promise<MoldResponse> {
    return this.moldHooks.request(request);
  }

}
