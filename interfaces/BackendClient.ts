import {RequestBase} from './RequestBase';
import BackendResponse from './BackendResponse';


export default interface BackendClient {
  // actually it shouldn't do reject of promise. On error it should set status and errors.
  request(set: string, request: RequestBase): Promise<BackendResponse>;
}
