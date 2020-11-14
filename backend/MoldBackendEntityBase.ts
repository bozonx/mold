import {CreateProps, DeleteProps, FindProps, GetItemProps, UpdateProps} from '../frontend/interfaces/MethodsProps';
import {FindResult, GetResult} from '../frontend/interfaces/MethodsState';


export default class MoldBackendEntityBase {
  find(props: Omit<Omit<FindProps, 'backend'>, 'entity'>): Promise<FindResult> {
    // TODO: выполнить хуки before
    // TODO: сделать запрос в db adapter
    // TODO: выполнить хуки after
  }

  get(props: Omit<Omit<GetItemProps, 'backend'>, 'entity'>): Promise<GetResult> {

  }

  create(props: Omit<Omit<CreateProps, 'backend'>, 'entity'>): Promise<void> {

  }

  update(props: Omit<Omit<UpdateProps, 'backend'>, 'entity'>): Promise<void> {

  }

  delete(props: Omit<Omit<DeleteProps, 'backend'>, 'entity'>): Promise<void> {

  }
}
