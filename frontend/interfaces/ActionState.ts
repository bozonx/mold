import {MoldResponse} from '../../interfaces/MoldResponse';


export interface ActionState<T = any> extends MoldResponse<T> {
  // it is loading or saving first time or further at the moment
  pending: boolean;
  // loaded or saved at least once or it is in a cache
  finishedOnce: boolean;
  // success, status, errors, result - for last response
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

export interface MoldDocument {
  id: string | number;
  [index: string]: any;
}

export type CreateResponse = MoldDocument;

export interface InstanceState {
  // string like "backend|set|action|request|instanceNum"
  __instanceId: string;
}

export type InstanceActionState<T = any> = ActionState<T> & InstanceState;
