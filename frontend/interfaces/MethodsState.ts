import {JsonTypes} from '../../interfaces/Types';

interface RequestError {
  code: number;
  message: string;
}

interface RequestState {
  // it it is loading first time or further
  loading: boolean;
  // loaded almost once or it is in a cache
  loadedOnce: boolean;
  // errors of last request
  lastErrors: RequestError[] | null;
}

// TODO: review

export interface FindResponse<T = any> {

  // TODO: add status, errors

  // count of all the items in the table. -1 means no error or not loaded.
  count: number;
  hasNext: boolean;
  hasPrev: boolean;
  items: T[] | null;
}

// TODO: review

export interface GetResponse<T = any> {

  // TODO: add status, errors


  item: T | null;
}

export interface InstanceState {
  // string like "backend|set|action|request|instanceNum"
  __instanceId: string;
}

export interface ListState<T = any> extends RequestState, FindResponse<T>, InstanceState {
}

export interface ItemState<T = any> extends RequestState, GetResponse<T>, InstanceState {
  // creating or updating
  saving: boolean;
  // soft or hard deleting
  deleting: boolean;
}

export interface ActionState<T> extends RequestState {
  data: T | null;
}
