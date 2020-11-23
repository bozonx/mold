import MoldRequest from './MoldRequest';
import {MoldResponse} from './MoldResponse';
import Mold from '../frontend/Mold';


export default interface BackendClient {
  $init?(mold: Mold);

  destroy(): void;

  // actually it shouldn't do reject of promise. On error it should set status and errors.
  request(request: MoldRequest): Promise<MoldResponse>;
}
