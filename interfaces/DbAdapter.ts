import {MoldResponse} from './MoldResponse';
import {CreateResponse, ItemResponse, ListResponse, MoldDocument} from '../frontend/interfaces/ActionState';


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
  ): Promise<MoldResponse<CreateResponse>>;

  patch(
    set: string,
    // TODO: зачем тут id ??? лучше наверное указывать в data
    id: string | number,
    partialData: Record<string, any>,
    meta?: Record<string, any>
  ): Promise<MoldResponse>;

  delete(
    set: string,
    id: string | number,
    meta?: Record<string, any>
  ): Promise<MoldResponse>;

  batchCreate(
    set: string,
    docs: Record<string, any>[],
    meta?: Record<string, any>
  ): Promise<MoldResponse<CreateResponse[]>>;

  batchPatch(
    set: string,
    docs: MoldDocument[],
    meta?: Record<string, any>
  ): Promise<MoldResponse>;

  batchDelete(
    set: string,
    ids: (string | number)[],
    meta?: Record<string, any>
  ): Promise<MoldResponse>;

  getField(): Promise<void>;
  hasField(): Promise<boolean>;
  createField(): Promise<void>;
  updateField(): Promise<void>;
  deleteField(): Promise<void>;

  getSet(): Promise<void>;
  hasSet(): Promise<boolean>;
  createSet(): Promise<void>;
  renameSet(): Promise<void>;
  deleteSet(): Promise<void>;

  onRecordChange(cb: RecordChangeHandler): number;
  removeListener(handlerIndex: number);

  // getDb(dbName: string): Promise<DbAdapterDbInstance>;
  // hasDb(dbName: string): Promise<boolean>;
  // createDb(dbName: string): Promise<void>;
  // renameDb(dbName: string, newName: string): Promise<void>;
  // deleteDb(dbName: string): Promise<void>;
}
