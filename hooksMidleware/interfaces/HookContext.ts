import MoldRequest from '../../interfaces/MoldRequest';
import BackendResponse from '../../interfaces/BackendResponse';
import HooksApp from '../HooksApp';


export default interface HookContext {
  // singleton to call some methods etc
  readonly app: HooksApp;
  // before request, after request and special hooks such as beforeRequest, error etc.
  readonly type: 'before' | 'after' | 'special';
  // name of set which is processed this request
  // or special middleware such as beforeRequest, afterHooks, error etc.
  readonly set: string;
  readonly request: MoldRequest;
  // there is a result of request. It is available only with "after" hooks.
  readonly response?: BackendResponse;
  // use it for shared data between hooks in during whole request life.
  readonly shared: {[index: string]: any};
}
