import {MoldRequest} from '../../interfaces/MoldRequest';
import {MoldResponse} from '../../interfaces/MoldResponse';
import ContextApp from '../ContextApp';
import {HookType} from './HookType';


/**
 * Context which is global for whole request handling life cycle.
 */
export interface GlobalContext {
  // in before hooks you can modify the request
  request: MoldRequest;
  // This is only for "after" branch
  // there is a result of request. It is available only with "after" hooks.
  // You can modify it in after hooks
  response?: MoldResponse;
  // This is for all the branches
  // use it for shared data between hooks during whole request life.
  shared: {[index: string]: any};
}

/**
 * Context which is passed to each hook.
 */
export interface HookContext extends GlobalContext {
  // singleton to call some methods etc
  readonly app: ContextApp;
  // before request, after request and special hooks such as beforeRequest, error etc.
  readonly type: HookType;
}
