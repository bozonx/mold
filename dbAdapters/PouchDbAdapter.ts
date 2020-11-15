import DbAdapter from '../interfaces/DbAdapter';
import {CreateProps, DeleteProps, FindProps, GetItemProps, UpdateProps} from '../frontend/interfaces/MethodsProps';
import {FindResponse, GetResponse} from '../frontend/interfaces/MethodsState';


export default class PouchDbAdapter implements DbAdapter {
  // TODO: revuew interface

  find(props: Omit<Omit<FindProps, 'backend'>, 'entity'>): Promise<FindResponse> {
    // TODO: add
  }

  get(props: Omit<Omit<GetItemProps, 'backend'>, 'entity'>): Promise<GetResponse> {
    // TODO: add
  }

  create(props: Omit<Omit<CreateProps, 'backend'>, 'entity'>): Promise<void> {
    // TODO: add
  }

  update(props: Omit<Omit<UpdateProps, 'backend'>, 'entity'>): Promise<void> {
    // TODO: add
  }

  delete(props: Omit<Omit<DeleteProps, 'backend'>, 'entity'>): Promise<void> {
    // TODO: add
  }

}
