import {FindProps} from './interfaces/MethodsProps';
import {ListState, ItemState} from './interfaces/MethodsState';


export default class StateStorage {
  // storage like { stateId: { loading: true, ... } }
  private storage: {[index: string]: {[index: string]: any}} = {};


  setupList(requestId: string, props: FindProps, initialState: ListState) {
    // TODO: сгенерировать id запроса
    // TODO: если нет стейта то создать новый на основе initialState
  }

  setupItem() {

  }

  update(requestId: string, partialState: Partial<ListState>) {
    // TODO: внести изменения
    // TODO: поднять события
  }

  destroy(requestId: string) {
    // TODO: remove storage
    // TODO: remove event listeners of storage
  }

  onChange(requestId, cb: (newState: any) => void): number {

  }

  removeListener(handlerIndex: number) {

  }

}
