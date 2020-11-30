import {MoldResponse} from './MoldResponse';
import {CreateResponse, ItemResponse, ListResponse} from './ReponseStructure';
import {MoldDocument} from './MoldDocument';
import {FindQuery} from './FindQuery';
import {GetQuery} from './GetQuery';


/**
 * * created - means the item is totally new.
 * * update - it is put(means replace) or patch. Id hasn't been changed.
 * * deleted - item has been deleted.
 */
export enum DB_ADAPTER_EVENT_TYPES {
  created,
  updated,
  deleted,
}


export type RecordChangeHandler = (
  set: string,
  id: string,
  type: DB_ADAPTER_EVENT_TYPES,
) => void;

export const DB_ADAPTER_EVENTS = {
  change: 'change',
  error: 'error',
};


export interface DbAdapter {
  destroy(): Promise<void>;

  /**
   * Request several items by query
   */
  find(set: string, query: FindQuery): Promise<MoldResponse<ListResponse>>;

  /**
   * Request one item usually by id
   */
  get(set: string, query: GetQuery): Promise<MoldResponse<ItemResponse>>;

  create(
    set: string,
    // it can have an id or not
    data: Partial<MoldDocument>,
    query?: Record<string, any>
  ): Promise<MoldResponse<CreateResponse>>;

  patch(
    set: string,
    // set id here and some partial data to be changed.
    partialData: MoldDocument,
    query?: Record<string, any>
  ): Promise<MoldResponse<null>>;

  /**
   * Hard delete
   */
  delete(
    set: string,
    id: string | number,
    query?: Record<string, any>
  ): Promise<MoldResponse<null>>;

  batchCreate(
    set: string,
    // it can have an id or not
    docs: Partial<MoldDocument>[],
    query?: Record<string, any>
  ): Promise<MoldResponse<CreateResponse[]>>;

  batchPatch(
    set: string,
    docs: MoldDocument[],
    query?: Record<string, any>
  ): Promise<MoldResponse<null>>;

  /**
   * Batch hard delete
   */
  batchDelete(
    set: string,
    ids: (string | number)[],
    query?: Record<string, any>
  ): Promise<MoldResponse<null>>;


  // TODO: add migration methods

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

}
