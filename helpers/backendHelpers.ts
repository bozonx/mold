import MoldRequest from '../interfaces/MoldRequest';
import {MoldResponse} from '../interfaces/MoldResponse';
import {DbAdapter} from '../interfaces/DbAdapter';


export function resolveAdapterRequestAction(
  adapter: DbAdapter,
  request: MoldRequest
): Promise<MoldResponse> {
  if (request.action === 'find') {
    if (!request.query) throw new Error(`No query in request ${JSON.stringify(request)}`)

    return adapter.find(
      request.set,
      request.query,
      request.meta,
    );
  }
  // TODO: add others

  throw new Error(
    `Mold adapters doesn't support custom actions especially "${request.action}"`
  );
}
