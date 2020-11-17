import {CreateProps, DeleteProps, FindProps, GetItemProps, UpdateProps} from '../frontend/interfaces/MethodsProps';
import {FindResponse, GetResponse} from '../frontend/interfaces/MethodsState';
import {MoldHook} from '../interfaces/MoldHooks';
import MoldSet from './interfaces/MoldSet';


interface MoldSetItemProps {
  // table name or path to list. If not set then set name will be used.
  path?: string;
  [index: string]: any
}


export default class MoldSetItem implements MoldSet {
  constructor(props: MoldSetItemProps, hooks: MoldHook[]) {
  }


  $setup() {

  }


  find(props: Omit<Omit<FindProps, 'backend'>, 'entity'>): Promise<FindResponse> {
    // TODO: выполнить хуки before
    // TODO: сделать запрос в db adapter
    // TODO: выполнить хуки after
  }

  get(props: Omit<Omit<GetItemProps, 'backend'>, 'entity'>): Promise<GetResponse> {

  }

  create(props: Omit<Omit<CreateProps, 'backend'>, 'entity'>): Promise<void> {

  }

  update(props: Omit<Omit<UpdateProps, 'backend'>, 'entity'>): Promise<void> {

  }

  delete(props: Omit<Omit<DeleteProps, 'backend'>, 'entity'>): Promise<void> {

  }

}
