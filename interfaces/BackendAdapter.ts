import {FindResult, GetResult} from '../frontend/interfaces/MethodsState';
import {
  CreateProps,
  DeleteProps,
  FindProps,
  GetItemProps,
  UpdateProps
} from '../frontend/interfaces/MethodsProps';


export default interface BackendAdapter {
  find(props: Omit<FindProps, 'backend'>): Promise<FindResult>;
  get(props: Omit<GetItemProps, 'backend'>): Promise<GetResult>;
  create(props: Omit<CreateProps, 'backend'>): Promise<void>;
  update(props: Omit<UpdateProps, 'backend'>): Promise<void>;
  delete(props: Omit<DeleteProps, 'backend'>): Promise<void>;
}
