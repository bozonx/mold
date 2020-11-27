import {DB_ADAPTER_EVENT_TYPES} from './DbAdapter';


export enum PUSH_MESSAGE_POSITIONS {
  set,
  id,
  type,
}

export type PushMessage = [
  // set
  string,
  // id
  (string | number),
  // created = 0, updated = 1, deleted = 2
  DB_ADAPTER_EVENT_TYPES
];
