import {ActionState} from './interfaces/MethodsState';
import {RequestKey} from './interfaces/RequestKey';
import Mold from './Mold';
import StorageAdapter from './interfaces/StorageAdapter';
import StorageDefault from './StorageDefault';
import {makeInitialState, requestKeyToString} from '../helpers/common';
import IndexedEventEmitter from '../helpers/IndexedEventEmitter';


export default class StorageManager {
  private readonly storage: StorageAdapter;
  private readonly events = new IndexedEventEmitter();


  constructor(mold: Mold) {
    if (mold.props.storage) {
      this.storage = mold.props.storage;
    }
    else {
      this.storage = new StorageDefault();
    }

    if (this.storage.$init) this.storage.$init(mold);

    this.storage.onChange(this.handleChange);
  }


  /**
   * Init state in case it hasn't been initialized before.
   */
  initStateIfNeed(requestKey: RequestKey) {
    const id: string = requestKeyToString(requestKey);
    // do nothing if there is previously defined state
    if (this.storage.hasState(id)) return;

    this.storage.put(id, makeInitialState());
  }

  patch(requestKey: RequestKey, partialState: Partial<ActionState>) {
    const id: string = requestKeyToString(requestKey);

    this.storage.patch(id, partialState);
  }

  /**
   * Delete state and event handlers
   */
  delete(requestKey: RequestKey) {
    const id: string = requestKeyToString(requestKey);

    this.storage.delete(id);
    this.events.removeAllListeners(id);
  }

  destroy() {
    this.storage.destroy();
    this.events.destroy();
  }

  /**
   * Listen of changes of any part of state of request
   */
  onChange(requestKey: RequestKey, cb: (newState: any) => void): number {
    const id: string = requestKeyToString(requestKey);

    return this.events.addListener(id, cb);
  }

  removeListener(handlerIndex: number) {
    this.events.removeListener(handlerIndex);
  }


  private handleChange = (id: string) => {
    if (!this.storage.hasState(id)) return;

    this.events.emit(id, this.storage.getState(id));
  }

}
