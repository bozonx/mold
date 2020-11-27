import {ActionState} from './interfaces/ActionState';
import {RequestKey} from './interfaces/RequestKey';
import Mold from './Mold';
import StorageAdapter from './interfaces/StorageAdapter';
import {makeInitialState, requestKeyToString} from '../helpers/common';
import IndexedEventEmitter from '../helpers/IndexedEventEmitter';


export default class StorageManager {
  private readonly mold: Mold;
  private readonly events = new IndexedEventEmitter();

  private get store(): StorageAdapter {
    return this.mold.props.storage!;
  }


  constructor(mold: Mold) {
    this.mold = mold;

    if (this.store.$init) this.store.$init(mold);

    this.store.onChange(this.handleChange);
  }

  destroy() {
    this.store.destroy();
    this.events.destroy();
  }


  getState(requestKey: RequestKey): ActionState | undefined {
    const id: string = requestKeyToString(requestKey);

    return this.store.getState(id);
  }

  /**
   * Init state in case it hasn't been initialized before.
   */
  initStateIfNeed(requestKey: RequestKey) {
    const id: string = requestKeyToString(requestKey);
    // do nothing if there is previously defined state
    if (this.store.hasState(id)) return;

    this.store.put(id, makeInitialState());
  }

  patch(requestKey: RequestKey, partialState: Partial<ActionState>) {
    const id: string = requestKeyToString(requestKey);

    this.store.patch(id, partialState);
  }

  /**
   * Delete state and event handlers
   */
  delete(requestKey: RequestKey) {
    const id: string = requestKeyToString(requestKey);

    this.store.delete(id);
    this.events.removeAllListeners(id);
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
    const state = this.store.getState(id);

    if (!state) return;

    this.events.emit(id, state);
  }

}
