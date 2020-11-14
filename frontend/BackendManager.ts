import {FindResult} from './interfaces/MethodsState';
import {FindProps} from './interfaces/MethodsProps';


export default class BackendManager {
  find<T>(props: FindProps): FindResult<T> {

    // TODO: сохранить запрос

    // cb({
    //   loadedOnce: true,
    //   items: [{ id: 0, name: 'aa' }],
    // } as any);
    //
    // setTimeout(() => {
    //   cb({
    //     items: [{ id: 0, name: 'aabb' }, { id: 2, name: 'ggg' }],
    //   } as any);
    // }, 5000)
  }

}
