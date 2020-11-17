import {JsonTypes} from './Types';


export interface RequestBase {
  // find, get, create, patch, delete or some custom action
  action: string;
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
