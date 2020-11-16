import {Logger} from './Logger';
import MoldFrontendConfig from './MoldFrontendConfig';
import BackendClient from '../../interfaces/BackendClient';
import StorageAdapter from './StorageAdapter';


export default interface MoldFrontendProps {
  config: MoldFrontendConfig;
  // fill almost one backend. Name of backend is used in any request.
  // "default" backend doesn't have to be specified in request.
  backends: {[index: string]: BackendClient};
  storage?: StorageAdapter;
  logger: Logger;
}
