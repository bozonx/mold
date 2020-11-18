import MoldRequest from '../../interfaces/MoldRequest';
import BackendResponse from '../../interfaces/BackendResponse';
import HooksApp from '../HooksApp';
import {HookType} from './HookType';
import {MoldError} from '../MoldError';


export interface GlobalContext {
  // singleton to call some methods etc
  readonly app: HooksApp;
  // in before hooks you can modify the request
  request: MoldRequest;
  // there is a result of request. It is available only with "after" hooks.
  // You can modify it in after hooks
  response?: BackendResponse;
  // it is only used in hooks of error set.
  error?: MoldError;
  // use it for shared data between hooks during whole request life.
  shared: {[index: string]: any};
}

export interface HookContext {
  // before request, after request and special hooks such as beforeRequest, error etc.
  readonly type: HookType;
  // name of set which is processed this request
  // or special middleware such as beforeRequest, afterHooks, error etc.
  readonly set: string;
}
