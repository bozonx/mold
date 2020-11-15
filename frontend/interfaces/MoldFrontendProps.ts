import {Logger} from './Logger';
import MoldFrontendConfig from './MoldFrontendConfig';
import BackendClient from '../../interfaces/BackendClient';
import PushAdapter from '../../interfaces/PushAdapter';


export default interface MoldFrontendProps {
  config: MoldFrontendConfig;
  // fill almost one backend. Name of backend is used in any request.
  // "default" backend doesn't have to be specified in request.
  backends: {[index: string]: BackendClient};
  // pushes names have to correspond to backends names.
  pushed: {[index: string]: PushAdapter};
  logger: Logger;
}
