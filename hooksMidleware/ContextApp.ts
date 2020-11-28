import {MoldRequest} from '../interfaces/MoldRequest';
import MoldHooks from './MoldHooks';
import {MoldResponse} from '../interfaces/MoldResponse';
import {MoldDocument} from '../interfaces/MoldDocument';


/**
 * This is "context: {app}" of for each hook.
 */
export default class ContextApp {
  readonly user?: MoldDocument;

  private moldHooks: MoldHooks;


  constructor(moldHooks: MoldHooks, user?: MoldDocument) {
    this.moldHooks = moldHooks;
    this.user = user;
  }

  destroy() {
  }


  isAuthorized(): boolean {
    return Boolean(this.user);
  }

  /**
   * Make some request which will be processed with its own hooks.
   */
  request(request: MoldRequest): Promise<MoldResponse> {
    return this.moldHooks.request(request);
  }

}
