import {JsonTypes} from './Types';


export interface MoldRequest {
  set: string;
  // find, get, create, patch, delete or some custom action
  action: string;
  // TODO: может пернести в query ???
  // for get, patch, delete.
  id?: string | number;
  // data like in search part of url or some specific to backend.
  // id, pageNum, perPage
  query?: {[index: string]: JsonTypes};
  // Data to save. For create, patch, batchPatch, batchDelete
  data?: {[index: string]: JsonTypes} | {[index: string]: JsonTypes}[] | (string | number)[];
}
