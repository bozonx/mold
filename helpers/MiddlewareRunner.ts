import {cloneDeepObject} from 'squidlet-lib/src/objects'

import {MoldDocument} from '../interfaces/MoldDocument'
import {MiddlewareRequestFunc, MoldMiddleware} from '../interfaces/MoldMiddleware'
import {MoldRequest} from '../interfaces/MoldRequest'
import {MoldResponse} from '../interfaces/MoldResponse'


// TODO: move to squidlet-lib.
//       Deal with MoldDocument, MoldRequest, MoldResponse, user


/**
 * Run middleware at each request.
 * Middlewares have a short life time, they live only while they are run
 */
export class MiddlewareRunner {
  private requestFunc: MiddlewareRequestFunc
  private middlewares: MoldMiddleware[]


  constructor(
    requestFunc: MiddlewareRequestFunc,
    middlewares: MoldMiddleware[] | MoldMiddleware = []
  ) {
    this.requestFunc = requestFunc
    this.middlewares = (Array.isArray(middlewares)) ? middlewares : [middlewares]
  }

  destroy() {
    // @ts-ignore
    delete this.requestFunc
    // @ts-ignore
    delete this.middlewares
  }


  async run(request: MoldRequest, user?: MoldDocument): Promise<MoldResponse> {
    // if it doesn't have any middlewares then just do the pure request
    if (!this.middlewares.length) return this.requestFunc(request)

    const preparedUser: MoldDocument | undefined = (user ?? false)
      ? cloneDeepObject(user)
      : undefined
    const preparedRequest: MoldRequest = cloneDeepObject(request)
    const response: MoldResponse = {
      status: 0,
      success: false,
      errors: null,
      result: null,
    }

    for (const middleware of this.middlewares) {
      await middleware(
        this.requestFunc,
        preparedRequest,
        response,
        preparedUser
      )
    }

    return response
  }

}
