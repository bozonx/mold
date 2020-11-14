import {
  CreateOrUpdateProps,
  CreateProps, DeleteProps,
  FindProps,
  GetFirstProps,
  GetItemProps,
  UpdateProps
} from './interfaces/MethodsProps';
import {ItemsState, ItemState} from './interfaces/MethodsState';


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
  get = async <T>(props: GetItemProps, cb: (state: ItemState<T>) => void): Promise<void> => {
    // cb({
    //   loadedOnce: true,
    //   item: { id: 0, name: 'tttt' },
    // } as any);
    //
    // setTimeout(() => {
    //   cb({
    //     item: { id: 0, name: 'yyyyyy' },
    //   } as any);
    // }, 5000)
  }

  /**
   * Get the first result by query
   */
  getFirst = async <T>(props: GetFirstProps, cb: (state: ItemState<T>) => void): Promise<void> => {
    // TODO: add
  }

  create = async (props: CreateProps): Promise<void> => {
    // TODO: add
  }

  update = async (props: UpdateProps): Promise<void> => {
    // TODO: add
  }

  createOrUpdate = async (props: CreateOrUpdateProps): Promise<void> => {
    // TODO: add
  }


  deleteItem = async (props: DeleteProps): Promise<void> => {
    // TODO: add
  }

  // TODO: add
  butchUpdate = async (): Promise<void> => {
    // TODO: add
  }

  // TODO: add
  butchDelete = async (): Promise<void> => {
    // TODO: add
  }

  // TODO: add
  /**
   * Call some action at backend
   */
  acton = async (): Promise<void> => {
    // TODO: add
  }

}
