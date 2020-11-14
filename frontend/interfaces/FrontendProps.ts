import {Logger} from './Logger';
import BackendAdapter from '../../interfaces/BackendAdapter';


export default interface FrontendProps {
  // fill almost "default" one
  backends: {[index: string]: BackendAdapter};
  logger: Logger;
}
