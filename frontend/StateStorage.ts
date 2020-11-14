import {FindProps} from './interfaces/MethodsProps';
import {ListState, ItemState} from './interfaces/MethodsState';


export default class StateStorage {
  // storage like { stateId: { loading: true, ... } }
  private storage: {[index: string]: {[index: string]: any}} = {};


  makeStateId(props: FindProps): string {
    // TODO: use все виды props
    // TODO: из параметров сделать уникальный id
    // TODO: поля должны быть отсортированны
  }

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

  destroy(stateId: string) {
    // TODO: remove storage
    // TODO: remove event listeners of storage
  }

  onChange(stateId, cb: (newState: any) => void): number {

  }

  removeListener(handlerIndex: number) {

  }

}
