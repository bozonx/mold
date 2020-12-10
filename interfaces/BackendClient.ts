import {MoldRequest} from './MoldRequest';
import {MoldResponse} from './MoldResponse';
import Mold from '../frontend/Mold';


export interface BackendClient {
  $init?(mold: Mold, backendName: string): Promise<void>;

  destroy?(): Promise<void>;

  // It throws an error only on fatal error
  request(request: MoldRequest): Promise<MoldResponse>;
}
