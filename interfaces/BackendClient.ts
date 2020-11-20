import MoldRequest from './MoldRequest';
import {MoldResponse} from './MoldResponse';
import Mold from '../frontend/Mold';


export default interface BackendClient {
  $init?(mold: Mold);
  // actually it shouldn't do reject of promise. On error it should set status and errors.
  request(set: string, request: MoldRequest): Promise<MoldResponse>;
}
