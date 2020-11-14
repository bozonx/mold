import {FindProps} from './interfaces/MethodsProps';
import {ListState, ItemState} from './interfaces/MethodsState';

export default class StateStorage {
  setupList(props: FindProps, initialState: ListState<any>): string {
    // TODO: сгенерировать id запроса
    // TODO: если нет стейта то создать новый на основе initialState
  }

  setupItem() {

  }

  update(stateId: string, partialState: Partial<ListState<any>>) {
    // TODO: внести изменения
    // TODO: поднять события
  }

  onChange(stateId, cb: (newState: any) => void): number {

  }

  removeListener(handlerIndex: number) {

  }

}
