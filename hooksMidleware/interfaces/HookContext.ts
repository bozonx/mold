import MoldRequest from '../../interfaces/MoldRequest';
import BackendResponse from '../../interfaces/BackendResponse';
import HooksApp from '../HooksApp';
import {HookType} from './HookType';
import {MoldError} from '../../interfaces/MoldError';


export interface HookContext {
  // singleton to call some methods etc
  readonly app: HooksApp;
  // before request, after request and special hooks such as beforeRequest, error etc.
  readonly type: HookType;
  // name of set which is processed this request
  // or special middleware such as beforeRequest, afterHooks, error etc.
  readonly set: string;
  // in before hooks you can modify the request
  readonly request: MoldRequest;
  // there is a result of request. It is available only with "after" hooks.
  // You can modify it in after hooks
  response?: BackendResponse;
  // put error here to prevent other hooks and stop processing
  //error?: MoldError;
  // use it for shared data between hooks in during whole request life.
  readonly shared: {[index: string]: any};
}
