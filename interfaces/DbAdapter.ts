import {MoldResponse} from './MoldResponse';
import MoldRequest from './MoldRequest';


export type RecordChangeHandler = () => void;


export default interface DbAdapter {

  find(request: MoldRequest): Promise<MoldResponse>;

  get(request: MoldRequest): Promise<MoldResponse>;

  create(request: MoldRequest): Promise<void>;

  update(request: MoldRequest): Promise<void>;

  delete(request: MoldRequest): Promise<void>;

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

  getDb(): Promise<void>;
  hasDb(): Promise<boolean>;
  createDb(): Promise<void>;
  renameDb(): Promise<void>;
  deleteDb(): Promise<void>;

  onRecordChange(cb: RecordChangeHandler): number;
  removeListener(handlerIndex: number);
}
