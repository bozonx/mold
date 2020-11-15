import {JsonTypes} from '../../interfaces/Types';


export interface RequestBase {
  // data like in search part of url
  query?: {[index: string]: JsonTypes};
  // hidden specific data
  meta?: {[index: string]: JsonTypes};
}

interface MethodPropsBase extends RequestBase {
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

interface SavingBase extends MethodPropsBase {
  // data to save
  data: {[index: string]: any};
}

////////////// METHODS

export type FindMethodProps = MethodPropsBase & FindBase;

export interface GetMethodProps extends MethodPropsBase {
  id?: string | number,
}

export interface CreateProps extends SavingBase {
}

export interface UpdateProps extends SavingBase {
  id: string | number,
  // data can include id or not - it doesn't matter
}

export interface CreateOrUpdateProps extends SavingBase {
  id?: string | number,
  // data can include id or not - it doesn't matter
}

export interface DeleteProps extends MethodPropsBase {
  id: string | number,
}
