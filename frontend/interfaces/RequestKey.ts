export const REQUEST_KEY_SEPARATOR = '|';

export enum REQUEST_KEY_POSITIONS {
  backend,
  set,
  action,
  request,
}


export type RequestKey = [
  // backend
  string,
  // set
  string,
  // action: find, get, getFirst, actionGet.
  string,
  // request hash. This is a hash of serialized id and query
  string,
];
