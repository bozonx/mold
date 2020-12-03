import {JsonTypes} from './Types';


export interface MoldRequest {
  set: string;
  // find, get, create, patch, delete or some custom action
  action: string;
  // for get, patch, delete.
  id?: string | number;
  // data like in search part of url or some specific to backend.
  // id, pageNum, perPage
  query?: Record<string, JsonTypes>;
  // Data to save. For create, patch, batchPatch, batchDelete
  data?: Record<string, JsonTypes> | Record<string, JsonTypes>[] | (string | number)[];
}
