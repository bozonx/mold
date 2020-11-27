import {Logger, LogLevel} from '../../shared/intefaces/Logger';
import {MoldFrontendConfig} from './MoldFrontendConfig';
import BackendClient from '../../interfaces/BackendClient';
import StorageAdapter from './StorageAdapter';


export default interface MoldProps {
  // it app in production mode.
  // In not production mode the window.$mold variable will be set for debug purpose.
  production?: boolean;
  config?: MoldFrontendConfig;
  // fill almost one backend. Name of backend is used in any request.
  // "default" backend doesn't have to be specified in request.
  backends?: {[index: string]: BackendClient};
  storage?: StorageAdapter;
  log?: Logger | LogLevel;
}
