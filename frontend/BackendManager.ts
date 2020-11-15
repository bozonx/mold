import {FindResponse, GetResponse} from './interfaces/MethodsState';
import {FindMethodProps, GetMethodProps} from './interfaces/MethodsProps';
import MoldFrontend from './MoldFrontend';
import {RequestKey} from './interfaces/RequestKey';


export default class BackendManager {
  constructor(mold: MoldFrontend) {
  }


  // TODO: бэкэнд должен всегда возвращать resolved

  find<T>(requestKey: RequestKey, props: FindMethodProps): FindResponse<T> {

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

  get<T>(requestKey: RequestKey, props: GetMethodProps): GetResponse<T> {

  }

}
