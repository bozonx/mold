import {CreateProps, DeleteProps, FindProps, GetItemProps, UpdateProps} from '../frontend/interfaces/MethodsProps';
import {FindResult, GetResult} from '../frontend/interfaces/MethodsState';

export default abstract class MoldBackendEntity {
  abstract find(props: Omit<Omit<FindProps, 'backend'>, 'entity'>): Promise<FindResult>;
  abstract get(props: Omit<Omit<GetItemProps, 'backend'>, 'entity'>): Promise<GetResult>;
  abstract create(props: Omit<Omit<CreateProps, 'backend'>, 'entity'>): Promise<void>;
  abstract update(props: Omit<Omit<UpdateProps, 'backend'>, 'entity'>): Promise<void>;
  abstract delete(props: Omit<Omit<DeleteProps, 'backend'>, 'entity'>): Promise<void>;
}
