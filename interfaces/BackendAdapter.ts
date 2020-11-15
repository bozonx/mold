import {FindResponse, GetResponse} from '../frontend/interfaces/MethodsState';
import {
  CreateProps,
  DeleteProps,
  FindProps,
  GetItemProps,
  UpdateProps
} from '../frontend/interfaces/MethodsProps';


export default interface BackendAdapter {
  find(props: Omit<FindProps, 'backend'>): Promise<FindResponse>;
  get(props: Omit<GetItemProps, 'backend'>): Promise<GetResponse>;
  create(props: Omit<CreateProps, 'backend'>): Promise<void>;
  update(props: Omit<UpdateProps, 'backend'>): Promise<void>;
  delete(props: Omit<DeleteProps, 'backend'>): Promise<void>;
}
