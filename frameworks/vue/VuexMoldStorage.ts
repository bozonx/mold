import {Store} from 'vuex'
import {StorageAdapter} from '../../frontend/interfaces/StorageAdapter'
import {ActionState} from '../../frontend/interfaces/ActionState'
import IndexedEventEmitter from '../../helpers/IndexedEventEmitter'


type MoldState = {[index: string]: ActionState}

const DEFAULT_MODULE_NAME = 'mold'
const SET_STATE_TYPE = `SET_STATE`
const CHANGE_EVENT = 'change'


export default class VuexMoldStorage implements StorageAdapter {
  readonly moduleName: string
  readonly setStatePath: string
  private readonly store: Store<any>
  private readonly events = new IndexedEventEmitter()
  private readonly unsubscribeCb: () => void


  constructor(vuexStore: Store<any>, moduleName: string = DEFAULT_MODULE_NAME) {
    this.moduleName = moduleName
    this.setStatePath = `${moduleName}/${SET_STATE_TYPE}`
    this.store = vuexStore

    this.store.registerModule(moduleName, {
      namespaced: true,
      state: {},
      mutations: {
        [SET_STATE_TYPE](state: MoldState, value: MoldState) {
          // fully replace state
          for(let key of Object.keys(value)) {
            if (value[key] === null) {
              delete state[key];
            }
            else {
              state[key] = value[key]
            }
          }
        }

      }
    })

    this.unsubscribeCb = this.store.subscribe((mutationPayload, wholeState: {mold: MoldState}) => {
      if (mutationPayload.type !== this.setStatePath) return

      const ids: string[] = Object.keys(mutationPayload.payload)

      for (let id of ids) {
        this.events.emit(CHANGE_EVENT, id)
      }
    })
  }

  destroy() {
    this.unsubscribeCb()
    this.store.unregisterModule(this.moduleName)
    this.events.destroy()
  }


  getState(id: string): ActionState | undefined {
    return this.store.state.mold[id]
  }

  hasState(id: string): boolean {
    return Boolean(this.store.state.mold[id])
  }

  put(id: string, newState: ActionState) {
    this.store.commit(this.setStatePath, {[id]: newState})
  }

  patch(id: string, newPartialState: Partial<ActionState>) {
    this.store.commit(this.setStatePath, {
      [id]: {
        ...this.store.state.mold[id],
        ...newPartialState,
      }
    })
  }

  delete(id: string) {
    this.store.commit(this.setStatePath, {[id]: null})
  }

  onChange(cb: (id: string) => void): number {
    return this.events.addListener(CHANGE_EVENT, cb)
  }

  removeListener(handlerIndex: number) {
    this.events.removeListener(handlerIndex)
  }

}
