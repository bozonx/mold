import {MoldRequest} from '../interfaces/MoldRequest';
import {MoldResponse} from '../interfaces/MoldResponse';
import {DbAdapter} from '../interfaces/DbAdapter';


export function callAdapterRequestAction(
  adapter: DbAdapter,
  request: MoldRequest
): Promise<MoldResponse<any>> {
  switch (request.action) {
    case 'find':

      // TODO: наверное не нужнео ???
      //if (!request.query) throw new Error(`No query in request ${JSON.stringify(request)}`)

      return adapter.find(
        request.set,
        request.query || {}
      );
    case 'get':
      if (typeof request.id === 'undefined') throw new Error(
        `No id in request ${JSON.stringify(request)}`
      );

      return adapter.get(
        request.set,
        request.id,
        request.query,
      );
    case 'create':
      if (!request.data) throw new Error(`No data in request ${JSON.stringify(request)}`);

      return adapter.create(
        request.set,
        request.data,
        request.query,
      );
    case 'patch':
      if (typeof request.id === 'undefined') throw new Error(
        `No id in request ${JSON.stringify(request)}`
      );
      else if (!request.data) throw new Error(`No data in request ${JSON.stringify(request)}`);

      return adapter.patch(
        request.set,
        request.id,
        request.data,
        request.query,
      );
    case 'delete':
      if (typeof request.id === 'undefined') throw new Error(
        `No id in request ${JSON.stringify(request)}`
      );

      return adapter.delete(
        request.set,
        request.id,
        request.query,
      );
    default:

      // TODO: call custom action

      // throw new Error(
      //   `Mold adapters doesn't support custom actions especially "${request.action}"`
      // );
  }
}
