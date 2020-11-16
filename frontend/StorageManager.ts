import {ListState, ItemState, ActionState} from './interfaces/MethodsState';
import {RequestKey} from './interfaces/RequestKey';
import Mold from './Mold';
import StorageAdapter from './interfaces/StorageAdapter';
import StorageDefault from './StorageDefault';
import {makeInitialState, requestKeyToString} from '../helpers/common';


export default class StorageManager {
  private readonly storage: StorageAdapter;


  constructor(mold: Mold) {
    if (mold.props.storage) {
      this.storage = mold.props.storage;
    }
    else {
      this.storage = new StorageDefault();
    }
  }


  /**
   * Init state in case it hasn't been initialized before.
   */
  initStateIfNeed(requestKey: RequestKey) {
    const id: string = requestKeyToString(requestKey);
    // do nothing if there is previously defined state
    if (this.storage.hasState(id)) return;

    this.storage.put(id, makeInitialState());

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
