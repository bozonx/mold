import StorageAdapter from './interfaces/StorageAdapter';
import {JsonTypes} from '../interfaces/Types';
import Mold from './Mold';
import {ActionState} from './interfaces/MethodsState';


export default class DefaultStore implements StorageAdapter {
  // storage like { "backend|set|action|requestKey": {...} }
  private storage: {[index: string]: {[index: string]: any}} = {};


  // constructor(mold: Mold) {
  // }


  getState(id: string): ActionState | undefined {

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
