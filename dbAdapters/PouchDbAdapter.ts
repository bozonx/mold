import DbAdapter from '../interfaces/DbAdapter';
import {CreateProps, DeleteProps, GetItemProps, UpdateProps} from '../frontend/interfaces/MethodsProps';
import {GetResult} from '../frontend/interfaces/MethodsState';


export default class PouchDbAdapter implements DbAdapter {
  // TODO: add
  // TODO: revuew interface

  get(props: Omit<Omit<GetItemProps, 'backend'>, 'entity'>): Promise<GetResult> {

  }

  create(props: Omit<Omit<CreateProps, 'backend'>, 'entity'>): Promise<void> {

  }

  update(props: Omit<Omit<UpdateProps, 'backend'>, 'entity'>): Promise<void> {

  }

  delete(props: Omit<Omit<DeleteProps, 'backend'>, 'entity'>): Promise<void> {

  }

}
