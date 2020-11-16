import {ActionState} from './MethodsState';


export default interface StorageAdapter {

  getState(id: string): ActionState;

  /**
   * Checks is state exists
   */
  hasState(id: string): boolean;

  /**
   * Create or replace state
   */
  put(id: string, newState: ActionState): void;

  /**
   * Update state partly
   */
  patch(id: string, newPartialState: ActionState): void;

  onChange(cb: (id: string) => void): void;
}
