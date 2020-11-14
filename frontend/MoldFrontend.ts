import {
  CreateOrUpdateProps,
  CreateProps, DeleteProps,
  FindProps,
  GetFirstProps,
  GetItemProps,
  UpdateProps
} from './interfaces/MethodsProps';
import {ItemsState} from './interfaces/MethodsResults';


export default class MoldFrontend {
  private onError: (msg: string) => void;


  constructor(onError: (msg: string) => void) {
    this.onError = onError;
  }


  /**
   * Find several records
   */
  find = async <T>(props: FindProps, cb: (state: ItemsState<T>) => void): Promise<void> => {
    // cb({
    //   loadedOnce: true,
    //   items: [{ id: 0, name: 'aa' }],
    // } as any);
    //
    // setTimeout(() => {
    //   cb({
    //     items: [{ id: 0, name: 'aabb' }, { id: 2, name: 'ggg' }],
    //   } as any);
    // }, 5000)
  }

  /**
   * Get certain record by id
   */
  getItem = async (props: GetItemProps) => {

  }

  /**
   * Get the first result by query
   */
  getFirst = async (props: GetFirstProps) => {

  }

  create(props: CreateProps): Promise<void> {

  }

  update(props: UpdateProps): Promise<void> {

  }

  createOrUpdate(props: CreateOrUpdateProps): Promise<void> {

  }


  deleteItem(props: DeleteProps): Promise<void> {

  }

  // TODO: add
  butchUpdate(): Promise<void> {

  }

  // TODO: add
  butchDelete(): Promise<void> {

  }

  // TODO: add
  /**
   * Call some action at backend
   */
  acton(): Promise<void> {

  }

}
