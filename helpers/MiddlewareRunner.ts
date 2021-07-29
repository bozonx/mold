import {MoldDocument} from '../interfaces/MoldDocument'
import {MiddlewareRequestFunc, MoldMiddleware} from '../interfaces/MoldMiddleware'
import {MoldRequest} from '../interfaces/MoldRequest'
import {MoldResponse} from '../interfaces/MoldResponse'


// TODO: move to squidlet-lib


/**
 * Run middleware at each request.
 * Middlewares have a short life time, they live only while they are run
 */
export class MiddlewareRunner {
  constructor(
    requestFunc: MiddlewareRequestFunc,
    user?: MoldDocument,
    middlewares: MoldMiddleware[] | MoldMiddleware = []
  ) {
    // TODO: предусмотреть что middlewares может не быть
  }

  destroy() {
    // TODO: add??
  }


  async run(request: MoldRequest): Promise<MoldResponse> {
    // TODO: add
  }

}
