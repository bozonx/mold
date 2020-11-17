import {JsonTypes} from './Types';


export interface RequestBase {
  // for get, patch, delete.
  id?: string | number;
  // data like in search part of url. Structure is specific to backend.
  // id, pageNum, perPage
  query?: {[index: string]: JsonTypes};
  // hidden specific data for backend's set.
  meta?: {[index: string]: JsonTypes};
  // Data to save. For create, patch, batchPatch, batchDelete
  data?: {[index: string]: JsonTypes} | {[index: string]: JsonTypes}[] | (string | number)[];
}


export default interface BackendRequest {
// TODO: review
}
