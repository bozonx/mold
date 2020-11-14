import {CreateProps, DeleteProps, FindProps, GetItemProps, UpdateProps} from '../frontend/interfaces/MethodsProps';
import {FindResult, GetResult} from '../frontend/interfaces/MethodsState';
import {MoldHook} from '../interfaces/MoldHooks';
import MoldSet from '../interfaces/MoldSet';


interface MoldSetTableProps {
  // table name or path to list. If not set then set name will be used.
  path?: string;
  [index: string]: any
}


export default class MoldSetTable implements MoldSet {
  constructor(props: MoldSetTableProps, hooks: MoldHook[]) {
  }


  $setup() {

  }


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
