import BackendAdapter from '../frontend/interfaces/BackendAdapter';
import {CreateProps, DeleteProps, FindProps, GetItemProps, UpdateProps} from '../frontend/interfaces/MethodsProps';
import {FindResult, GetResult} from '../frontend/interfaces/MethodsState';
import MoldBackend from '../backend/MoldBackend';


/**
 * Adapter for Mold Backend which is used locally on a client(browser) side.
 */
export default class MoldBackendLocalAdapter implements BackendAdapter {
  private readonly backend: MoldBackend;


  constructor(backend: MoldBackend) {
    this.backend = backend;
  }


  find(props: Omit<FindProps, 'backend'>): Promise<FindResult> {

  }

  get(props: Omit<GetItemProps, 'backend'>): Promise<GetResult> {

  }

  create(props: Omit<CreateProps, 'backend'>): Promise<void> {

  }

  update(props: Omit<UpdateProps, 'backend'>): Promise<void> {

  }

  delete(props: Omit<DeleteProps, 'backend'>): Promise<void> {

  }

}
