import {MoldResponse} from './MoldResponse';
import {ItemResponse, ListResponse} from '../frontend/interfaces/MethodsState';


export type RecordChangeHandler = (set: string, action: string, response: MoldResponse) => void;

export interface DbAdapter {
  destroy(): Promise<void>;

  find(
    set: string,
    query: Record<string, any>,
    meta?: Record<string, any>
  ): Promise<MoldResponse<ListResponse>>;

  get(
    set: string,
    id: string | number,
    meta?: Record<string, any>
  ): Promise<MoldResponse<ItemResponse>>;

  create(
    set: string,
    data: Record<string, any>,
    meta?: Record<string, any>
  ): Promise<MoldResponse>;

  patch(
    set: string,
    id: string | number,
    partialData: Record<string, any>,
    meta?: Record<string, any>
  ): Promise<MoldResponse>;

  delete(
    set: string,
    id: string | number,
    meta?: Record<string, any>
  ): Promise<MoldResponse>;

  getField(): Promise<void>;
  hasField(): Promise<boolean>;
  createField(): Promise<void>;
  updateField(): Promise<void>;
  deleteField(): Promise<void>;

  getTable(): Promise<void>;
  hasTable(): Promise<boolean>;
  createTable(): Promise<void>;
  renameTable(): Promise<void>;
  deleteTable(): Promise<void>;

  onRecordChange(cb: RecordChangeHandler): number;
  removeListener(handlerIndex: number);

  // getDb(dbName: string): Promise<DbAdapterDbInstance>;
  // hasDb(dbName: string): Promise<boolean>;
  // createDb(dbName: string): Promise<void>;
  // renameDb(dbName: string, newName: string): Promise<void>;
  // deleteDb(dbName: string): Promise<void>;
}
