import {
  CreateOrUpdateProps,
  CreateProps, DeleteProps,
  FindProps,
  GetFirstProps,
  GetItemProps,
  UpdateProps
} from './interfaces/MethodsProps';
import {FindChangeHandler} from './interfaces/MethodsResults';


export default class MoldFrontend {
  /**
   * Find several records
   */
  find = async <T>(props: FindProps, cb: FindChangeHandler<T>): Promise<void> => {

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
