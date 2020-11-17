import {JsonData} from '../../interfaces/Types';
import {ResponseError} from '../../interfaces/BackendResponse';


export interface ActionState<T = JsonData> {
  // it is loading or saving first time or further at the moment
  pending: boolean;
  // loaded or saved at least once or it is in a cache
  finishedOnce: boolean;
  // was the last response success or not
  responseSuccess: boolean | null;
  // last response status. Null while loading or saving
  responseStatus: number | null;
  // last response backend errors
  responseErrors: ResponseError[] | null;
  result: T | null;
}

// TODO: review

export interface ListResponse<T = any> {
  // count of all the items in the table. -1 means no error or not loaded.
  count: number;
  hasNext: boolean;
  hasPrev: boolean;
  data: T[] | null;
}

// TODO: review

export interface ItemResponse<T = any> {
  data: T | null;
}

export interface InstanceState {
  // string like "backend|set|action|request|instanceNum"
  __instanceId: string;
}

// export interface ListState<T = any> extends RequestState, FindResponse<T> {
// }
//
// export interface ItemState<T = any> extends RequestState, GetResponse<T> {
//   // creating or updating
//   saving: boolean;
//   // soft or hard deleting
//   deleting: boolean;
// }

// export type InstanceListState<T = any> = ListState<T> & InstanceState;
// export type InstanceItemState<T = any> = ItemState<T> & InstanceState;
export type InstanceActionState<T = any> = ActionState<T> & InstanceState;
