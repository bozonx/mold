import MoldRequest from '../../interfaces/MoldRequest';
import {MoldResponse} from '../../interfaces/MoldResponse';
import HooksApp from '../HooksApp';
import {HookType} from './HookType';
import {MoldError} from '../MoldError';


/**
 * Context which is global for whole request handling life.
 */
export interface GlobalContext {
  // in before hooks you can modify the request
  request: MoldRequest;
  // there is a result of request. It is available only with "after" hooks.
  // You can modify it in after hooks
  response?: MoldResponse;
  // it is only used in hooks of error set.
  error?: MoldError;
  // use it for shared data between hooks during whole request life.
  shared: {[index: string]: any};
}

/**
 * Context which is passed to each hook.
 */
export interface HookContext extends GlobalContext {
  // singleton to call some methods etc
  readonly app: HooksApp;
  // before request, after request and special hooks such as beforeRequest, error etc.
  readonly type: HookType;
  // name of set which is processed this request
  // or special middleware such as beforeRequest, afterHooks, error etc.
  //readonly set: string;
}
