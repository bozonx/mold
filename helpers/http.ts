
// TODO: add more statuses - see https://httpstatuses.com/

const HTTP_STATUS_MESSAGES = {
  200: 'OK',
  201: 'Created',
  204: 'No content',
  207: 'Multi-Status',
  400: 'Bad request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not found',
  405: 'Method Not Allowed',
  500: 'Internal server error',
  502: 'Bad Gateway',
  504: 'Gateway Timeout',
}


export function httpStatusMessage(status: number): string {
  return HTTP_STATUS_MESSAGES[status] || 'Unknown error';
}
