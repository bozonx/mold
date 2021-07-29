import {SetsDefinition} from './interfaces/MoldHook'
import {MiddlewareRequestFunc} from '../interfaces/MoldMiddleware'
import {MoldRequest} from '../interfaces/MoldRequest'
import {MoldResponse} from '../interfaces/MoldResponse'
import {MoldDocument} from '../interfaces/MoldDocument'
import MoldTransform from './MoldTransform'


export async function moldTransformMiddleware(rawSets: SetsDefinition) {
  const transform = new MoldTransform(rawSets)

  return async function (
    requestFunc: MiddlewareRequestFunc,
    request: MoldRequest,
    response: MoldResponse,
    user?: MoldDocument
  ) {
    transform.registerRequest(requestFunc)

    const transformResponse = await transform.request(request, user)

    Object.assign(response, transformResponse)
  }
}
