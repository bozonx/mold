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

export interface ItemsState<T> extends RequestState {
  // count of all the items in the table. -1 means no error or not loaded.
  count: number;
  hasNext: boolean;
  hasPrev: boolean;
  items: T[] | null;
}

export interface ItemState<T> extends RequestState {
  item: T;
}
