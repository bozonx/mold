import {JsonTypes} from '../../interfaces/Types';


export interface RequestBase {
  // for get, patch, delete.
  id?: string | number;
  // data like in search part of url. Structure is specific to backend.
  query?: {[index: string]: JsonTypes};
  // hidden specific data for backend's set.
  meta?: {[index: string]: JsonTypes};
  // Data to save. For create, patch, batchPatch, batchDelete
  data?: {[index: string]: JsonTypes} | {[index: string]: JsonTypes}[] | (string | number)[];
}

export interface MethodPropsBase extends RequestBase {
  // Backend where set is placed. If it isn't set it points to the default backend.
  backend?: string;
  // name of entity which is queried. It is mandatory
  set: string,
}

export interface FindBase {
  // Page number. The first is 1. By default is 1. Don't use it if perPage = -1.
  pageNum?: number,
  // Items per page. By default this is config.defaultPerPage. -1 means infinity list.
  perPage?: number,
}

////////////// METHODS

export type FindMethodProps = MethodPropsBase & FindBase;

export interface GetMethodProps extends MethodPropsBase {
  //id?: string | number,
}

export interface SaveMethodProps extends MethodPropsBase {
  // data to save. Id doesn't matter, it should be set into query
  data: {[index: string]: JsonTypes};
}

export type CreateMethodProps = SaveMethodProps;

export interface PatchMethodProps extends MethodPropsBase {
  //id: string | number,
  // You cat pass an id in a request top or inside data
}

export interface DeleteMethodProps extends MethodPropsBase {
  id: string | number,
}

export interface BatchPatchMethodProps extends MethodPropsBase {
  // Partial data of items to patch. Items have to include an id
  data: {[index: string]: JsonTypes}[];
}

export interface BatchDeleteMethodProps extends MethodPropsBase {
  // Ids of items to delete
  data: (string | number)[];
}
