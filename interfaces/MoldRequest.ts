import {JsonTypes} from './Types'


export type MoldRequestData = Record<string, JsonTypes> | Record<string, JsonTypes>[] | (string | number)[]

export interface MoldRequest {
  set: string
  // find, get, create, patch, delete or some custom action
  action: string
  // data like in search part of url or some specific to backend.
  // Such as id, pageNum, pageSize, some filter params or specific backend's action params.
  // For patch and delete please set an id here.
  query?: Record<string, JsonTypes>
  // Data to save. For create, patch etc
  data?: MoldRequestData
}
