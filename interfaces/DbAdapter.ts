import {MoldResponse} from './MoldResponse';
import MoldRequest from './MoldRequest';


export type RecordChangeHandler = () => void;


export interface DbAdapterDbInstance {
  destroy(): Promise<void>;

  find(): Promise<MoldResponse>;

  get(): Promise<MoldResponse>;

  create(): Promise<void>;

  update(): Promise<void>;

  delete(): Promise<void>;

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
}

export interface DbAdapter {
  destroy(): Promise<void>;
  getDb(dbName: string): Promise<DbAdapterDbInstance>;
  hasDb(dbName: string): Promise<boolean>;
  createDb(dbName: string): Promise<void>;
  renameDb(dbName: string, newName: string): Promise<void>;
  deleteDb(dbName: string): Promise<void>;
}
