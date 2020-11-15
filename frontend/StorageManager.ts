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
    // TODO: сгенерировать id запроса
    // TODO: если нет стейта то создать новый на основе initialState
    // TODO: use makeItemsInitialState()
  }

  initItem() {

  }

  update(requestId: string, partialState: Partial<ListState>) {
    // TODO: внести изменения
    // TODO: поднять события
  }

  destroy(requestId: string) {
    // TODO: remove storage
    // TODO: remove event listeners of storage
  }

  onChange(requestId, cb: (newState: any) => void): number {

  }

  removeListener(handlerIndex: number) {

  }

}
