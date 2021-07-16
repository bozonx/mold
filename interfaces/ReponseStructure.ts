import {MoldDocument} from './MoldDocument'


export interface ListResponse<T = MoldDocument> {
  // count of all the items according this request. -1 means no error or not loaded.
  count: number
  hasNext: boolean
  hasPrev: boolean
  data: T[] | null
}

export interface ItemResponse<T = MoldDocument> {
  data: T | null
}

export type CreateResponse = { id: string | number }
export type BatchResponse = { id: string | number, _index: number }[] | null
