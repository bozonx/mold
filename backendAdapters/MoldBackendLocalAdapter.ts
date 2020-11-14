import BackendAdapter from '../frontend/interfaces/BackendAdapter';
import {CreateProps, DeleteProps, FindProps, GetItemProps, UpdateProps} from '../frontend/interfaces/MethodsProps';
import {FindResult, GetResult} from '../frontend/interfaces/MethodsState';
import MoldBackend from '../backend/MoldBackend';
import {omitObj} from '../helpers/objects';


/**
 * Adapter for Mold Backend which is used locally on a client(browser) side.
 */
export default class MoldBackendLocalAdapter implements BackendAdapter {
  private readonly backend: MoldBackend;


  constructor(backend: MoldBackend) {
    this.backend = backend;
  }


  find(props: Omit<FindProps, 'backend'>): Promise<FindResult> {
    return this.backend.getEntity(props.entity).find(omitObj(props, 'entity'));
  }

  get(props: Omit<GetItemProps, 'backend'>): Promise<GetResult> {
    return this.backend.getEntity(props.entity).get(omitObj(props, 'entity'));
  }

  create(props: Omit<CreateProps, 'backend'>): Promise<void> {
    return this.backend.getEntity(props.entity).create(omitObj(props, 'entity'));
  }

  update(props: Omit<UpdateProps, 'backend'>): Promise<void> {
    return this.backend.getEntity(props.entity).update(omitObj(props, 'entity'));
  }

  delete(props: Omit<DeleteProps, 'backend'>): Promise<void> {
    return this.backend.getEntity(props.entity).delete(omitObj(props, 'entity'));
  }

}
