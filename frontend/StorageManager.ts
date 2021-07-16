import Mold from './Mold'
import {ActionState} from './interfaces/ActionState'
import {StorageAdapter} from './interfaces/StorageAdapter'
import {makeInitialActionState} from '../helpers/helpers'
import IndexedEventEmitter from '../helpers/IndexedEventEmitter'
import {ActionProps} from './interfaces/ActionProps'
import {PROPS_NAME_IN_STORAGE} from './constants'


export default class StorageManager {
  private readonly mold: Mold
  private readonly events = new IndexedEventEmitter()

  private get store(): StorageAdapter {
    // TODO: почему через props???
    return this.mold.props.storage
  }


  constructor(mold: Mold) {
    this.mold = mold
    // init store if need
    this.store.$init?.(mold)
    // start listen store changes
    this.store.onChange(this.handleChange)
  }

  destroy() {
    this.store.destroy()
    this.events.destroy()
  }


  getState(id: string): ActionState | undefined {
    return this.store.getState(id)
  }

  getProps(id: string): ActionProps | undefined {
    return this.store.getState(id)?.[PROPS_NAME_IN_STORAGE]
  }

  hasState(id: string): boolean {
    return this.store.hasState(id)
  }

  /**
   * Init state in case it hasn't been initialized before.
   */
  initStateIfNeed(id: string, props: ActionProps) {
    // do nothing if there is previously defined state
    if (this.store.hasState(id)) return

    this.store.put(id, makeInitialActionState(props))
  }

  patch(id: string, partialState: Partial<ActionState>) {
    // TODO: $props должен быть объектом или undefined - но тогда лучше удалить undefined
    this.store.patch(id, partialState)
  }

  /**
   * Delete state and event handlers
   */
  delete(id: string) {
    this.store.delete(id)
    this.events.removeAllListeners(id)
  }

  /**
   * Listen of changes of any part of state of request
   */
  onChange(id: string, cb: (newState: any) => void): number {
    return this.events.addListener(id, cb)
  }

  removeListener(handlerIndex: number) {
    this.events.removeListener(handlerIndex)
  }


  private handleChange = (id: string) => {
    const state = this.store.getState(id)

    if (!state) return

    this.events.emit(id, state)
  }

}
