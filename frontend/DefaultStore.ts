import {StorageAdapter} from './interfaces/StorageAdapter'
import {ActionState} from './interfaces/ActionState'
import IndexedEventEmitter from '../helpers/IndexedEventEmitter'


const changeEvent = 'change'


export default class DefaultStore implements StorageAdapter {
  // storage like { "id": {...} }
  private store: {[index: string]: ActionState} = {}
  private readonly events = new IndexedEventEmitter()


  constructor() {
  }

  destroy() {
    this.events.destroy()
    this.store = {}
  }


  getState(id: string): ActionState | undefined {
    return this.store[id]
  }

  hasState(id: string): boolean {
    return Boolean(this.store[id])
  }

  put(id: string, newState: ActionState) {
    this.store[id] = newState

    this.events.emit(id)
  }

  patch(id: string, newPartialState: Partial<ActionState>) {
    this.store[id] = {
      ...this.store[id],
      ...newPartialState,
    }

    this.events.emit(id)
  }

  delete(id: string) {
    delete this.store[id]
  }

  onChange(cb: (id: string) => void): number {
    return this.events.addListener(changeEvent, cb)
  }

  removeListener(handlerIndex: number) {
    this.events.removeListener(handlerIndex)
  }

}
