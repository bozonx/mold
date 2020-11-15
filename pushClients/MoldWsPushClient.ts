import MoldBackend from '../backend/MoldBackend';
import PushClient from '../interfaces/PushClient';


export default class MoldWsPushClient implements PushClient {
  private readonly backend: MoldBackend;


  constructor(backend: MoldBackend) {
    this.backend = backend;
  }


  // TODO: add
}
