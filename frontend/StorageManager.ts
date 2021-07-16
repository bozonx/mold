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
    return this.mold.props.storage!
  }


  constructor(mold: Mold) {
    this.mold = mold
    // init store if need
    this.store.init?.(mold)
    // start listen store changes
    this.store.onChange(this.handleChange)
  }

  destroy() {
    this.store.destroy()
    this.events.destroy()
  }


  getState(instanceId: string): ActionState | undefined {
    return this.store.getState(instanceId)
  }

  getProps(instanceId: string): ActionProps | undefined {
    return this.store.getState(instanceId)?.[PROPS_NAME_IN_STORAGE]
  }

  hasState(instanceId: string): boolean {
    return this.store.hasState(instanceId)
  }

  /**
   * Init state in case it hasn't been initialized before.
   */
  initStateIfNeed(instanceId: string, props: ActionProps) {
    // do nothing if there is previously defined state
    if (this.store.hasState(instanceId)) return

    this.store.put(instanceId, makeInitialActionState(props))
  }

  patch(instanceId: string, partialState: Partial<ActionState>) {
    // TODO: $props должен быть объектом или undefined - но тогда лучше удалить undefined
    // TODO: запретить менять в props backend, set, action
    // TODO: props это либо объект либо не мержим его
    this.store.patch(instanceId, partialState)
  }

  /**
   * Delete state and event handlers
   */
  delete(instanceId: string) {
    this.store.delete(instanceId)
    this.events.removeAllListeners(instanceId)
  }

  /**
   * Listen of changes of any part of state of request
   */
  onChange(instanceId: string, cb: (newState: any) => void): number {
    return this.events.addListener(instanceId, cb)
  }

  removeListener(handlerIndex: number) {
    this.events.removeListener(handlerIndex)
  }


  private handleChange = (instanceId: string) => {
    const state = this.store.getState(instanceId)

    if (!state) return

    this.events.emit(instanceId, state)
  }

}
