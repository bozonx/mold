import {MoldResponse} from '../../interfaces/MoldResponse'
// TODO: use squidlet-lib
import {httpStatusMessage} from '../../helpers/http'
import {BatchResponse, CreateResponse} from '../../interfaces/ReponseStructure'
import {MoldErrorDefinition} from '../../interfaces/MoldErrorDefinition'
import {SET_DELIMITER} from './constants'
import {ErrorResponse, PutSuccess} from './interfaces'


export function makeDbId(set: string, id: string | number): string {
  return set + SET_DELIMITER + id
}

export function makeErrorResponse(
  dbErrorResponse: Pick<ErrorResponse, 'status'> & Partial<Pick<ErrorResponse, 'message'>>
): MoldResponse {
  const message: string = (dbErrorResponse.message)
    ? dbErrorResponse.message
    : httpStatusMessage(dbErrorResponse.status)

  return {
    status: dbErrorResponse.status,
    success: false,
    errors: [{code: dbErrorResponse.status, message}],
    result: null,
  }
}

export function makeBatchResponse(
  docIds: (string | number)[],
  batchResult: (PutSuccess | ErrorResponse)[]
): MoldResponse<BatchResponse> {
  const errors: MoldErrorDefinition[] = []
  const successResult: (CreateResponse & {_index: number})[] = []

  for (let index in batchResult) {
    const errorItem = batchResult[index] as ErrorResponse

    if (errorItem.error) {
      errors.push({ code: errorItem.status, message: errorItem.message })
    }
    else {
      successResult.push({ id: docIds[index], _index: parseInt(index) })
    }
  }

  return {
    // 207 means multi status
    status: (errors) ? 207 : 200,
    success: Boolean(errors),
    errors: (errors.length) ? errors : null,
    result: (successResult.length) ? successResult : null,
  }
}
