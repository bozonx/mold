import {RequestBase} from '../frontend/interfaces/MethodsProps';


export default interface HookContext extends RequestBase {

  // TODO: add: app, error, method, path, statusCode

  // use it for shared data between hooks
  context: {[index: string]: any};
  // there is a result of request. It is available only with "after" hooks.
  result?: any;

  readonly type: 'before' | 'after' | 'error';
}
