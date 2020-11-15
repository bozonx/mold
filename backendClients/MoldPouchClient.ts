import BackendClient from '../interfaces/BackendClient';
import {FindResponse, GetResponse} from '../frontend/interfaces/MethodsState';
import {omitObj} from '../helpers/objects';


/**
 * Adapter for Mold Backend which is used locally on a client(browser) side.
 */
export default class MoldPouchClient implements BackendClient {
  private readonly backend: MoldBackend;


  constructor(backend: MoldBackend) {
    this.backend = backend;
  }


  find(props: Omit<FindProps, 'backend'>): Promise<FindResponse> {
    return this.backend.getEntity(props.entity).find(omitObj(props, 'entity') as any);
  }

  get(props: Omit<GetItemProps, 'backend'>): Promise<GetResponse> {
    return this.backend.getEntity(props.entity).get(omitObj(props, 'entity') as any);
  }

  create(props: Omit<CreateProps, 'backend'>): Promise<void> {
    return this.backend.getEntity(props.entity).create(omitObj(props, 'entity') as any);
  }

  update(props: Omit<UpdateProps, 'backend'>): Promise<void> {
    return this.backend.getEntity(props.entity).update(omitObj(props, 'entity') as any);
  }

  delete(props: Omit<DeleteProps, 'backend'>): Promise<void> {
    return this.backend.getEntity(props.entity).delete(omitObj(props, 'entity') as any);
  }

}
