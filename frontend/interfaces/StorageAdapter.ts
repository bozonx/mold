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
  put(id: string, newState: ActionState);

  /**
   * Update state partly
   */
  patch(id: string, newPartialState: Partial<ActionState>);

  /**
   * Delete state and don't rise events on delete.
   * It shouldn't rise any events after deleting
   */
  delete(id: string);

  onChange(cb: (id: string) => void): number;

  removeListener(handlerIndex: number);

  destroy();
}
