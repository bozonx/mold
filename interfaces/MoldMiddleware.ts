import {MoldRequest} from './MoldRequest'
import {MoldDocument} from './MoldDocument'
import {MoldResponse} from './MoldResponse'


/**
 * External request func.
 * On fatal error it throws a new Error(message). And then cycle will be interrupted.
 */
export type MiddlewareRequestFunc = (request: MoldRequest) => Promise<MoldResponse>


/**
 * @param requestFunc - function to do any requests
 * @param request - request which can be modified if need at whole lifetime cycle
 * @param response - response which Can be modified if need at whole lifetime cycle
 * @param user - current authorized user is exist
 */
export type MoldMiddleware = (
  requestFunc: MiddlewareRequestFunc,
  request: MoldRequest,
  response: MoldResponse,
  user?: MoldDocument
) => Promise<void>
