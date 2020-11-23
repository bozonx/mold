import {MoldResponse} from './MoldResponse';
import MoldRequest from './MoldRequest';


export type RecordChangeHandler = () => void;


export default interface DbAdapter {

  find(request: MoldRequest): Promise<MoldResponse>;

  get(request: MoldRequest): Promise<MoldResponse>;

  create(request: MoldRequest): Promise<void>;

  update(request: MoldRequest): Promise<void>;

  delete(request: MoldRequest): Promise<void>;

  getTable(): Promise<void>;
  createTable(): Promise<void>;
  renameTable(): Promise<void>;
  deleteTable(): Promise<void>;

  getDb(): Promise<void>;
  createDb(): Promise<void>;
  renameDb(): Promise<void>;
  deleteDb(): Promise<void>;

  onRecordChange(cb: RecordChangeHandler): number;
  removeListener(handlerIndex: number);
}
