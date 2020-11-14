interface RequestError {
  code: number;
  message: string;
}

export interface ItemsState<T> {
  // it it is loading first time or further
  loading: boolean;
  // loaded almost once or it is in a cache
  loadedOnce: boolean;
  // count of all the items in the table
  count?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  items?: T[];
  // errors of last request
  lastErrors?: RequestError[];
}

export type FindChangeHandler<T> = (state: ItemsState<T>) => void;

// export interface FindResult<T> {
//   // promise of request
//   promise: Promise<void>;
//   //onChange: (cb: ChangeHandler<T>) => void,
//   //state: ItemsState<T>;
// }
