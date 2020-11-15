import BackendRequest from './BackendRequest';
import BackendResponse from './BackendResponse';


export default interface BackendClient {
  // actually it shouldn't do reject of promise. On error it should set status and errors.
  request(request: BackendRequest): Promise<BackendResponse>;
}
