import PushClient from '../interfaces/PushClient';


export default class MoldServiceWorkerPushClient implements PushClient {
  private readonly backend: MoldBackend;


  constructor(backend: MoldBackend) {
    this.backend = backend;
  }


  // TODO: add
}
