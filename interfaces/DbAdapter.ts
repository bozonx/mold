import {MoldResponse} from './MoldResponse';
import {CreateResponse, ItemResponse, ListResponse} from './ReponseStructure';
import {MoldDocument} from './MoldDocument';


/**
 * * created - means the item is totally new and an id was generated.
 * * update - it is put or patch. Id hasn't been changed.
 * * deleted - item has been deleted.
 */
export type DbAdapterEventType = 'created' | 'updated' | 'deleted';
export type RecordChangeHandler = (
  set: string,
  id: string,
  type: DbAdapterEventType,
) => void;

export const DB_ADAPTER_EVENTS = {
  change: 'change',
  error: 'error',
};

export const DB_ADAPTER_EVENT_TYPES: Record<string, DbAdapterEventType> = {
  created: 'created',
  updated: 'updated',
  deleted: 'deleted',
}


export interface DbAdapter {
  destroy(): Promise<void>;

  find(
    set: string,
    query: Record<string, any>
  ): Promise<MoldResponse<ListResponse>>;

  get(
    set: string,
    // TODO: наверное тут и везде id должны быть строкой
    id: string | number,
    query?: Record<string, any>
  ): Promise<MoldResponse<ItemResponse>>;

  create(
    set: string,
    data: Record<string, any>,
    query?: Record<string, any>
  ): Promise<MoldResponse<CreateResponse>>;

  patch(
    set: string,
    // TODO: зачем тут id ??? лучше наверное указывать в data
    id: string | number,
    partialData: Record<string, any>,
    query?: Record<string, any>
  ): Promise<MoldResponse>;

  delete(
    set: string,
    id: string | number,
    query?: Record<string, any>
  ): Promise<MoldResponse>;

  batchCreate(
    set: string,
    docs: Record<string, any>[],
    query?: Record<string, any>
  ): Promise<MoldResponse<CreateResponse[]>>;

  batchPatch(
    set: string,
    docs: MoldDocument[],
    query?: Record<string, any>
  ): Promise<MoldResponse>;

  batchDelete(
    set: string,
    ids: (string | number)[],
    query?: Record<string, any>
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
