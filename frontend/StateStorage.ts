import {FindProps} from './interfaces/MethodsProps';
import {ItemsState, ItemState} from './interfaces/MethodsState';

export default class StateStorage {
  setupList(props: FindProps, initialState: ItemsState<any>): string {
    // TODO: сгенерировать id запроса
    // TODO: если нет стейта то создать новый на основе initialState
  }

  setupItem() {

  }

  update(stateId: string, partialState: Partial<ItemsState<any>>) {
    // TODO: внести изменения
    // TODO: поднять события
  }

  onChange(cb: (newState: ItemsState<any> | ItemState<any>) => void) {

  }

}
