import {JsonTypes} from '../../interfaces/Types';
import StorageAdapter from '../../frontend/interfaces/StorageAdapter';
import Mold from '../../frontend/Mold';
import {ActionState} from '../../frontend/interfaces/MethodsState';


export default class VuexMoldStorage implements StorageAdapter {
  constructor(mold: Mold) {
    console.log(44444444444, mold)
  }


  getState(id: string): ActionState {

  }

  hasState(id: string): boolean {

  }

  put(id: string, newState: ActionState) {

  }

  patch(id: string, newPartialState: Partial<ActionState>) {

  }

  delete(id: string) {

  }

  onChange(cb: (id: string) => void): number {

  }

  removeListener(handlerIndex: number) {

  }

  destroy() {

  }

}
