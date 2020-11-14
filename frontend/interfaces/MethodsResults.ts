interface RequestError {
  code: number;
  message: string;
}

export interface ItemsState<T> {
  // it it is loading first time or further
  loading: boolean;
  // loaded almost once or it is in a cache
  loadedOnce: boolean;
  // count of all the items in the table. -1 means no error or not loaded.
  count: number;
  hasNext: boolean;
  hasPrev: boolean;
  items: T[] | null;
  // errors of last request
  lastErrors: RequestError[] | null;
}

//export type FindChangeHandler<T> = (state: ItemsState<T>) => void;

// export interface FindResult<T> {
//   // promise of request
//   promise: Promise<void>;
//   //onChange: (cb: ChangeHandler<T>) => void,
//   //state: ItemsState<T>;
// }
