import {CreateProps, DeleteProps, FindProps, GetItemProps, UpdateProps} from '../frontend/interfaces/MethodsProps';
import {FindResponse, GetResponse} from '../frontend/interfaces/MethodsState';

export default interface DbAdapter {

  // TODO: remove meta. Review props
  // TODO: review
  find(props: Omit<Omit<FindProps, 'backend'>, 'entity'>): Promise<FindResponse>;

  get(props: Omit<Omit<GetItemProps, 'backend'>, 'entity'>): Promise<GetResponse>;

  create(props: Omit<Omit<CreateProps, 'backend'>, 'entity'>): Promise<void>;

  update(props: Omit<Omit<UpdateProps, 'backend'>, 'entity'>): Promise<void>;

  delete(props: Omit<Omit<DeleteProps, 'backend'>, 'entity'>): Promise<void>;

}
