import {FindMethodProps} from './interfaces/MethodsProps';
import {ListState, ItemState} from './interfaces/MethodsState';
import {RequestKey} from './interfaces/RequestKey';


export default class StorageManager {
  // storage like { stateId: { loading: true, ... } }
  private storage: {[index: string]: {[index: string]: any}} = {};


  /**
   * Init list state in case it hasn't been initialized before.
   */
  initListIfNeed(requestKey: RequestKey) {
    // TODO: если нет стейта то создать новый на основе initialState
    // TODO: use makeListInitialState()
  }

  initItemIfNeed(requestKey: RequestKey) {
    // TODO: если нет стейта то создать новый на основе initialState
    // TODO: use makeItemInitialState()
  }

  updateList(requestKey: RequestKey, partialState: Partial<ListState>) {
    // TODO: внести изменения
    // TODO: поднять события
  }

  updateItem(requestKey: RequestKey, partialState: Partial<ItemState>) {
    // TODO: внести изменения
    // TODO: поднять события
  }

  destroyRequest(requestKey: RequestKey) {
    // TODO: remove storage
    // TODO: remove event listeners of storage
  }

  destroy() {
    // TODO: add
  }

  /**
   * Listen of changes of any part of state of request
   */
  onChange(requestKey: RequestKey, cb: (newState: any) => void): number {
    // TODO: add
  }

  removeListener(handlerIndex: number) {
    // TODO: add
  }

}
