import {ListState, ItemState, ActionState} from './interfaces/MethodsState';
import {RequestKey} from './interfaces/RequestKey';


export default class StorageManager {
  // TODO: нужно ли делать иерархию для того чтобы делать апдейты, для поиска что обновлять?
  // storage like { "backend|set|action|requestKey": {...} }
  private storage: {[index: string]: {[index: string]: any}} = {};


  /**
   * Init state in case it hasn't been initialized before.
   */
  initStateIfNeed(requestKey: RequestKey) {
    // TODO: если нет стейта то создать новый на основе initialState
    // TODO: use makeListInitialState()
  }

  // /**
  //  * Init list state in case it hasn't been initialized before.
  //  */
  // initListIfNeed(requestKey: RequestKey) {
  //   // TODO: если нет стейта то создать новый на основе initialState
  //   // TODO: use makeListInitialState()
  // }
  //
  // initItemIfNeed(requestKey: RequestKey) {
  //   // TODO: если нет стейта то создать новый на основе initialState
  //   // TODO: use makeItemInitialState()
  // }

  update(requestKey: RequestKey, partialState: Partial<ActionState>) {
    // TODO: внести изменения
    // TODO: поднять события
  }

  // updateList(requestKey: RequestKey, partialState: Partial<ListState>) {
  //   // TODO: внести изменения
  //   // TODO: поднять события
  // }
  //
  // updateItem(requestKey: RequestKey, partialState: Partial<ItemState>) {
  //   // TODO: внести изменения
  //   // TODO: поднять события
  // }

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
