import StorageAdapter from '../../frontend/interfaces/StorageAdapter';
import {ActionState} from '../../frontend/interfaces/MethodsState';
import {Store} from 'vuex';
import IndexedEventEmitter from '../../helpers/IndexedEventEmitter';


type MoldState = {[index: string]: ActionState};

const moduleName = 'mold';
const setStateType = `SET_STATE`;
const setStatePath = `${moduleName}/${setStateType}`;
const changeEvent = 'change';


export default class VuexMoldStorage implements StorageAdapter {
  private readonly store: Store<any>;
  private readonly events = new IndexedEventEmitter();
  private readonly unsubscribeCb: () => void;


  constructor(vuexStore: Store<any>) {
    this.store = vuexStore;

    this.store.registerModule('mold', {
      namespaced: true,
      state: {},
      mutations: {
        [setStateType](state: MoldState, value: MoldState) {
          // fully replace state
          for(let key of Object.keys(value)) {
            if (value[key] === null) {
              delete state[key];
            }
            else {
              state[key] = value[key];
            }
          }
        }

      }
    });

    this.unsubscribeCb = this.store.subscribe((mutationPayload, wholeState: {mold: MoldState}) => {
      if (mutationPayload.type !== setStatePath) return;

      const ids: string[] = Object.keys(mutationPayload.payload);

      for (let id of ids) {
        this.events.emit(changeEvent, id);
      }
    });
  }

  destroy() {
    this.unsubscribeCb();
    this.store.unregisterModule(moduleName);
    this.events.destroy();
  }


  getState(id: string): ActionState | undefined {
    return this.store.state.mold[id];
  }

  hasState(id: string): boolean {
    return Boolean(this.store.state.mold[id]);
  }

  put(id: string, newState: ActionState) {
    this.store.commit(setStatePath, {[id]: newState});
  }

  patch(id: string, newPartialState: Partial<ActionState>) {
    this.store.commit(setStatePath, {
      [id]: {
        ...this.store.state.mold[id],
        ...newPartialState,
      }
    });
  }

  delete(id: string) {
    this.store.commit(setStatePath, {[id]: null});
  }

  onChange(cb: (id: string) => void): number {
    return this.events.addListener(changeEvent, cb);
  }

  removeListener(handlerIndex: number) {
    this.events.removeListener(handlerIndex);
  }

}
