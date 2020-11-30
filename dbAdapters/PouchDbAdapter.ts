import PouchDB from 'pouchdb';

import {
  DB_ADAPTER_EVENT_TYPES,
  DB_ADAPTER_EVENTS,
  DbAdapter,
  RecordChangeHandler
} from '../interfaces/DbAdapter';
import {MoldResponse} from '../interfaces/MoldResponse';
import {makeUniqId} from '../helpers/uniqId';
import {omitObj} from '../helpers/objects';
import {MoldErrorDefinition} from '../interfaces/MoldErrorDefinition';
import {CreateResponse, ItemResponse, ListResponse} from '../interfaces/ReponseStructure';
import IndexedEventEmitter from '../helpers/IndexedEventEmitter';
import {FindQuery} from '../interfaces/FindQuery';
import {GetQuery} from '../interfaces/GetQuery';
import {MoldDocument} from '../interfaces/MoldDocument';
import {convertPageToOffset} from '../helpers/common';


interface PouchRecord {
  _id: string;
  _rev: string;
  [index: string]: any;
}

interface FindSuccess {
  offset: number;
  length: number;
  // the total number of ALL! non-deleted documents in the database
  total_rows: number;
  rows: {
    // full id in db
    id: string;
    key: string;
    value: {rev: string};
    doc: PouchRecord;
  }[];
}

type GetSuccess = PouchRecord;

interface PutSuccess {
  id: string;
  ok: boolean;
  rev: string;
}

type DeleteSuccess = PutSuccess;

interface ErrorResponse {
  // it seems that it always true
  error: boolean;
  // full message
  message: string,
  // status unique name such as not_found
  name: string;
  // status text
  reason: string;
  // like 404
  status: number;
}

interface PouchChangeResult {
  // full id of document
  id: string;
  changes: {rev: string}[];
  deleted?: boolean;
  seq: number;
  doc: Record<string, any>;
}

interface PouchEventEmitter {
  cancel();
  on(eventName: 'change', cb: (change: PouchChangeResult) => void);
  on(eventName: 'error', cb: (error: string) => void);
}

const SET_DELIMITER = '/';


export default class PouchDbAdapter implements DbAdapter {
  pouchDb: PouchDB;

  private readonly pouchEventEmitter: PouchEventEmitter;
  private readonly events = new IndexedEventEmitter();


  constructor(pouchDb: PouchDB) {
    this.pouchDb = pouchDb;
    this.pouchEventEmitter = this.pouchDb.changes({
      // listen all the events on once
      live: true,
      // means to listen after init, not to catch init messages.
      since: 'now',
      // this is needs to get an id of doc because the id can be a number.
      include_docs: true,
    });


    // TODO: поидее нужно ожидать пока выполнится промис db created
    this.pouchDb.on('created', () => {
      // TODO: ожидать создания базы ??? или это выше нужно сделать ???
    })

    this.pouchEventEmitter.on('change', this.handleChange);
    this.pouchEventEmitter.on('error', this.handleError);
  }

  async destroy(): Promise<void> {
    this.events.destroy();
    this.pouchEventEmitter.cancel();
    await this.pouchDb.close();
  }


  async find(set: string, query: FindQuery): Promise<MoldResponse<ListResponse>> {
    let result: FindSuccess;

    try {
      result = await this.pouchDb.allDocs({
        include_docs: true,
        startkey: set + SET_DELIMITER,
        endkey: set + SET_DELIMITER + '\ufff0',

        // TODO: вроде это не эффективный способ, нужно наверное view использовать
        ...convertPageToOffset(query.page, query.perPage),
        ...query,
      });
    }
    catch (e) {
      return this.makeErrorResponse(e);
    }

    return {
      status: 200,
      success: true,
      errors: null,
      result: {
        // TODO: на самом деле это вообще все записи в базе
        count: -1,
        // TODO: расчитать
        hasNext: false,
        // TODO: расчитать
        hasPrev: false,
        data: result.rows.map((item): MoldDocument => item.doc as any),
      },
    }
  }

  async get(set: string, query: GetQuery): Promise<MoldResponse<ItemResponse>> {
    let result: GetSuccess;

    if (typeof query.id === 'undefined' || query.id === null) {
      throw new Error(`Id has to be a string or number`);
    }

    try {
      result = await this.pouchDb.get(
        set + SET_DELIMITER + query.id,
        omitObj(query, 'id')
      );
    }
    catch (e) {
      return this.makeErrorResponse(e);
    }

    return {
      status: 200,
      success: true,
      errors: null,
      result: {
        data: result as any,
      },
    }
  }

  async create(
    set: string,
    data: Partial<MoldDocument>,
    query?: Record<string, any>
  ): Promise<MoldResponse<CreateResponse>> {
    let result: PutSuccess;
    const id: string = makeUniqId();

    try {
      result = await this.pouchDb.put({
        _id: set + SET_DELIMITER + id,
        id,
        ...data,
      }, query || {});
    }
    catch (e) {
      return this.makeErrorResponse(e);
    }

    return {
      status: 200,
      success: true,
      errors: null,
      result: {
        id,
        // _id: result.id,
        // _rev: result.rev,
      },
    }
  }

  async patch(
    set: string,
    partialData: MoldDocument,
    query?: Record<string, any>
  ): Promise<MoldResponse<null>> {
    let getResult: GetSuccess;
    const fullId = set + SET_DELIMITER + id;

    try {
      getResult = await this.pouchDb.get(fullId);
    }
    catch (e) {
      return this.makeErrorResponse(e);
    }

    let result: PutSuccess;

    try {
      result = await this.pouchDb.put({
        ...getResult,
        ...partialData,
        _id: fullId,
      }, query || {});
    }
    catch (e) {
      return this.makeErrorResponse(e);
    }

    // TODO: в ответе проверить ok

    return {
      status: 200,
      success: true,
      errors: null,
      result: {
        _id: result.id,
        _rev: result.rev,
      },
    }

  }

  async delete(
    set: string,
    id: string | number,
    query?: Record<string, any>
  ): Promise<MoldResponse<null>> {
    let getResult: GetSuccess;

    try {
      getResult = await this.pouchDb.get(set + SET_DELIMITER + id);
    }
    catch (e) {
      return this.makeErrorResponse(e);
    }

    let result: DeleteSuccess;

    try {
      result = await this.pouchDb.remove(getResult, query || {});
    }
    catch (e) {
      return this.makeErrorResponse(e);
    }

    // TODO: в ответе проверить ok

    return {
      status: 200,
      success: true,
      errors: null,
      result: {
        _id: result.id,
        _rev: result.rev,
      },
    }
  }

  async batchCreate(
    set: string,
    docs: Partial<MoldDocument>[],
    query?: Record<string, any>
  ): Promise<MoldResponse<CreateResponse[]>> {
    const preparedDocs = docs.map((doc) => {
      const id: string = (typeof doc.id === 'undefined') ? makeUniqId() : doc.id;

      return {
        _id: set + SET_DELIMITER + id,
        ...omitObj(doc, id),
      };
    });
    const result: (PutSuccess | ErrorResponse)[] = await this.pouchDb.bulkDocs(
      preparedDocs,
      query || {}
    );
    const errors: MoldErrorDefinition[] = [];
    const successResult: CreateResponse[] = [];

    for (let item of result) {
      if ((item as ErrorResponse).error) {
        const errorItem = item as ErrorResponse;

        errors.push({
          code: errorItem.status,
          message: errorItem.message,
        });
      }
      else {
        const successItem = item as PutSuccess;

        successResult.push({
          id: successItem.id.split(set + SET_DELIMITER)[0],
          _id: successItem.id,
          _rev: successItem.rev,
        });
      }
    }

    return {
      status: 200,
      success: true,
      errors: (errors.length) ? errors : null,
      // TODO: может все сохранять в одном порядке и ошибки тоже сюда
      result: (successResult.length) ? successResult : null,
    }
  }

  async batchPatch(
    set: string,
    docs: MoldDocument[],
    query?: Record<string, any>
  ): Promise<MoldResponse<null>> {

    // TODO: see docs

  }

  async batchDelete(
    set: string,
    ids: (string | number)[],
    query?: Record<string, any>
  ): Promise<MoldResponse<null>> {
    let findResult: FindSuccess;

    try {
      findResult = await this.pouchDb.allDocs({
        include_docs: false,
        keys: ids.map((id) => set + SET_DELIMITER + id),
      });
    }
    catch (e) {
      // TODO: а тут можен быть ошибка вообще ???
      return this.makeErrorResponse(e);
    }



    // TODO: сначала запросить эти доки, потом удалить все сразу
  }

  async getField(): Promise<void> {
    throw new Error(`PouchDbAdapter: doesn't support thw getField method`);
  }
  async hasField(): Promise<boolean> {
    throw new Error(`PouchDbAdapter: doesn't support thw hasField method`);
  }
  async createField(): Promise<void> {
    throw new Error(`PouchDbAdapter: doesn't support thw createField method`);
  }
  async updateField(): Promise<void> {
    throw new Error(`PouchDbAdapter: doesn't support thw updateField method`);
  }
  async deleteField(): Promise<void> {
    throw new Error(`PouchDbAdapter: doesn't support thw deleteField method`);
  }

  async getSet(): Promise<void> {
    throw new Error(`PouchDbAdapter: doesn't support thw getSet method`);
  }
  async hasSet(): Promise<boolean> {
    throw new Error(`PouchDbAdapter: doesn't support thw hasSet method`);
  }
  async createSet(): Promise<void> {
    throw new Error(`PouchDbAdapter: doesn't support thw createSet method`);
  }
  async renameSet(): Promise<void> {
    throw new Error(`PouchDbAdapter: doesn't support thw renameSet method`);
  }
  async deleteSet(): Promise<void> {
    throw new Error(`PouchDbAdapter: doesn't support thw deleteSet method`);
  }

  onRecordChange(cb: RecordChangeHandler): number {
    return this.events.addListener(DB_ADAPTER_EVENTS.change, cb);
  }

  removeListener(handlerIndex: number) {
    this.events.removeListener(handlerIndex);
  }


  private makeErrorResponse(dbErrorResponse: ErrorResponse): MoldResponse {
    return {
      status: dbErrorResponse.status,
      success: false,
      errors: [{code: dbErrorResponse.status, message: dbErrorResponse.message}],
      result: null,
    }
  }


  private handleChange = (change: PouchChangeResult) => {
    const [set] = change.id.split(SET_DELIMITER);
    let eventType: DB_ADAPTER_EVENT_TYPES = DB_ADAPTER_EVENT_TYPES.updated;

    if (change.deleted) {
      // was deleted
      eventType = DB_ADAPTER_EVENT_TYPES.deleted;
    }
    else {
      // else was put
      const [revNum, rest] = change.changes[0].rev.split('-');
      // 1 is the first insert
      if (revNum === '1') eventType = DB_ADAPTER_EVENT_TYPES.created;
    }

    this.events.emit(DB_ADAPTER_EVENTS.change, set, id, eventType);
  }

  private handleError = (error: string) => {
    // This event is fired when the changes feed is stopped due to an unrecoverable failure.
    // TODO: what to do on error ????
    // TODO: это просто внутренние ошибки, можно вывести в консоль

    console.log(88888888, error)
  }

}

// async getDb(dbName: string): Promise<DbAdapterDbInstance> {
//   if (!this.pouchDbInstances[dbName]) {
//
//     // TODO: если база не существует то ошибка
//
//     const pouchDb = new PouchDB(dbName);
//
//     this.pouchDbInstances[dbName] = new DbInstance(pouchDb);
//   }
//
//   // TODO: создать инстанс
//
//   return this.pouchDbInstances[dbName];
// }
//
// async hasDb(dbName: string): Promise<boolean> {
//
//   // TODO: не правильно !!! проверить саму базу
//
//   return Boolean(this.pouchDbInstances[dbName]);
// }
//
// async createDb(dbName: string): Promise<void> {
//   // TODO: если база существует - то ошибка
//   // if (!this.pouchDbInstances[dbName]) {
//   //   throw new Error(`Can't find pouch data base "${dbName}"`)
//   // }
//
//   const pouchDb = new PouchDB(dbName);
//
//   this.pouchDbInstances[dbName] = new DbInstance(pouchDb);
// }
//
// async renameDb(dbName: string, newName: string): Promise<void> {
//
//   // TODO: do rename
//
// }
//
// async deleteDb(dbName: string): Promise<void> {
//   if (!this.pouchDbInstances[dbName]) {
//     throw new Error(`Can't find pouch data base "${dbName}"`)
//   }
//
//   // TODO: cal delete pouch
//
//   // await db.destroy();
//
//   await this.pouchDbInstances[dbName].destroy();
//
//   delete this.pouchDbInstances[dbName];
// }
