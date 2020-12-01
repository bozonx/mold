import {MoldRequest} from '../interfaces/MoldRequest';
import {MoldResponse} from '../interfaces/MoldResponse';
import {DbAdapter} from '../interfaces/DbAdapter';
import {MoldDocument} from '../interfaces/MoldDocument';


export function callDbAdapterAction(
  adapter: DbAdapter,
  request: MoldRequest
): Promise<MoldResponse> {
  switch (request.action) {
    case 'find':
      return adapter.find(request.set,request.query || {});
    case 'get':
      return adapter.get(request.set, request.query || {});
    case 'create':
      if (!request.data) throw new Error(`No data in request ${JSON.stringify(request)}`);

      return adapter.create(request.set, request.data, request.query);
    case 'patch':
      if (!request.data) throw new Error(`No data in request ${JSON.stringify(request)}`);

      const doc = request.data as MoldDocument;

      if (typeof doc.id === 'undefined') throw new Error(
        `No id in request ${JSON.stringify(request)}`
      );

      return adapter.patch(request.set, doc, request.query);
    case 'delete':
      if (typeof request.id === 'undefined') throw new Error(
        `No id in request ${JSON.stringify(request)}`
      );

      return adapter.delete(request.set, request.id, request.query);
    case 'batchCreate':
      if (!request.data) throw new Error(`No data in request ${JSON.stringify(request)}`);
      else if (!Array.isArray(request.data)) {
        throw new Error(`Data has to be an array in request ${JSON.stringify(request)}`);
      }

      return adapter.batchCreate(
        request.set,
        request.data as Partial<MoldDocument>[],
        request.query
      );
    case 'batchPatch':
      if (!request.data) throw new Error(`No data in request ${JSON.stringify(request)}`);
      else if (!Array.isArray(request.data)) {
        throw new Error(`Data has to be an array in request ${JSON.stringify(request)}`);
      }

      return adapter.batchPatch(
        request.set,
        request.data as MoldDocument[],
        request.query
      );
    case 'batchDelete':
      if (!request.data) throw new Error(`No data in request ${JSON.stringify(request)}`);
      else if (!Array.isArray(request.data)) {
        throw new Error(`Data has to be an array in request ${JSON.stringify(request)}`);
      }

      return adapter.batchDelete(
        request.set,
        request.data as (string | number)[],
        request.query
      );
    default:
      // call some custom action
      return adapter.action(request.set, request.action, request.query, request.data);
  }
}
