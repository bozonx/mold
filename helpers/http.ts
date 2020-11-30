const HTTP_STATUS_MESSAGES = {
  400: `Bad request`,
  500: `Internal server error`,
}


export function httpStatusMessage(status: number): string {
  return HTTP_STATUS_MESSAGES[status] || 'Unknown error';
}
