import {JsonData} from '../../interfaces/Types';
import {ResponseError} from '../../interfaces/BackendResponse';

export const instanceIdPropName = '__instanceId';


export interface ActionState<T = JsonData> {
  // it is loading or saving first time or further at the moment
  pending: boolean;
  // loaded or saved at least once or it is in a cache
  finishedOnce: boolean;
  // last response status. Null while loading or saving
  responseStatus: number | null;
  // last response backend errors
  responseErrors: ResponseError[] | null;
  data: T | null;
}

// TODO: review

// export interface FindResponse<T = any> {
//
//   // TODO: add status, errors
//
//   // count of all the items in the table. -1 means no error or not loaded.
//   count: number;
//   hasNext: boolean;
//   hasPrev: boolean;
//   items: T[] | null;
// }
//
// // TODO: review
//
// export interface GetResponse<T = any> {
//
//   // TODO: add status, errors
//
//
//   item: T | null;
// }

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
