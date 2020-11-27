import PouchDB from 'pouchdb';

import {DbAdapter, RecordChangeHandler} from '../interfaces/DbAdapter';
import {MoldResponse} from '../interfaces/MoldResponse';
import {CreateResponse, ItemResponse, ListResponse} from '../frontend/interfaces/ActionState';
import {makeUniqId} from '../helpers/uniqId';
import {omitObj} from '../helpers/objects';
import {MoldErrorDefinition} from '../interfaces/MoldErrorDefinition';


interface PouchRecord {
  _id: string;
  _rev: string;
  [index: string]: any;
}

interface FindSuccess {
  offset: number;
  length: number;
  // the total number of non-deleted documents in the database
  total_rows: number;
  rows: {
    id: "root/1";
    key: "root/1";
    value: {rev: string};
    doc: PouchRecord;
  }[];
}

type GetSuccess = PouchRecord;

interface PutSuccess {
  id: string;
  ok: true
  rev: string;
}

type DeleteSuccess = PutSuccess;

interface ErrorResponse {
  error: true;
  // full message
  message: string,
  // status unique name such as not_found
  name: string;
  // status text
  reason: string;
  status: 404
}

const SET_DELIMITER = '/';


export default class PouchDbAdapter implements DbAdapter {
  db: PouchDB;


  constructor(db: typeof PouchDB) {
    this.db = db;
  }

  async destroy(): Promise<void> {
  }


  async find(
    set: string,
    query: Record<string, any>,
    meta?: Record<string, any>
  ): Promise<MoldResponse<ListResponse>> {
    let result: FindSuccess;

    try {
      result = await this.db.allDocs({
        include_docs: true,
        //startkey: set + SET_DELIMITER,
        startkey: set + SET_DELIMITER,
        endkey: set + SET_DELIMITER + '\ufff0',

        // TODO: расчитать соглсно perPage и pageNum
        //limit: 1,
        //skip: 1,
        ...meta,
      });
    }
    catch (e) {
      // TODO: а туту можен быть ошибка вообще ???
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
        data: result.rows.map((item) => item.doc),
      },
    }
  }

  async get(
    set: string,
    id: string | number,
    meta?: Record<string, any>
  ): Promise<MoldResponse<ItemResponse>> {
    let result: GetSuccess;

    try {
      result = await this.db.get(set + SET_DELIMITER + id, meta || {});
    }
    catch (e) {
      return this.makeErrorResponse(e);
    }

    return {
      status: 200,
      success: true,
      errors: null,
      result: {
        data: result,
      },
    }
  }

  async create(
    set: string,
    data: Record<string, any>,
    meta?: Record<string, any>
  ): Promise<MoldResponse<CreateResponse>> {
    let result: PutSuccess;
    const id: string = makeUniqId();

    try {
      result = await this.db.put({
        _id: set + SET_DELIMITER + id,
        id,
        ...data,
      }, meta || {});
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
        _id: result.id,
        _rev: result.rev,
      },
    }
  }

  async patch(
    set: string,
    id: string | number,
    partialData: Record<string, any>,
    meta?: Record<string, any>
  ): Promise<MoldResponse> {
    let getResult: GetSuccess;

    try {
      getResult = await this.db.get({
        _id: set + SET_DELIMITER + id,
      });
    }
    catch (e) {
      return this.makeErrorResponse(e);
    }

    let result: PutSuccess;

    try {
      result = await this.db.put({
        ...getResult,
        ...partialData,
      }, meta || {});
    }
    catch (e) {
      return this.makeErrorResponse(e);
    }

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
    meta?: Record<string, any>
  ): Promise<MoldResponse> {
    let getResult: GetSuccess;

    try {
      getResult = await this.db.get({
        _id: set + SET_DELIMITER + id,
      });
    }
    catch (e) {
      return this.makeErrorResponse(e);
    }

    let result: DeleteSuccess;

    try {
      result = await this.db.remove(getResult, meta || {});
    }
    catch (e) {
      return this.makeErrorResponse(e);
    }

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
    docs: Record<string, any>[],
    meta?: Record<string, any>
  ): Promise<MoldResponse<CreateResponse[]>> {
    const preparedDocs = docs.map((doc) => {
      const id: string = (typeof doc.id === 'undefined') ? makeUniqId() : doc.id;

      return {
        _id: set + SET_DELIMITER + id,
        ...omitObj(doc, id),
      };
    });
    const result: (PutSuccess | ErrorResponse)[] = await this.db.bulkDocs(
      preparedDocs,
      meta || {}
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
    docs: {id: string | number, [index: string]: any}[],
    meta?: Record<string, any>
  ): Promise<MoldResponse> {

    // TODO: see docs

  }

  async batchDelete(
    set: string,
    ids: (string | number)[],
    meta?: Record<string, any>
  ): Promise<MoldResponse> {
    let findResult: FindSuccess;

    try {
      findResult = await this.db.allDocs({
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
    // TODO: add
  }

  removeListener(handlerIndex: number) {

  }


  private makeErrorResponse(dbResponse: ErrorResponse): MoldResponse {
    return {
      status: dbResponse.status,
      success: false,
      errors: [{code: dbResponse.status, message: dbResponse.message}],
      result: null,
    }
  }
}

// async getDb(dbName: string): Promise<DbAdapterDbInstance> {
//   if (!this.dbInstances[dbName]) {
//
//     // TODO: если база не существует то ошибка
//
//     const pouchDb = new PouchDB(dbName);
//
//     this.dbInstances[dbName] = new DbInstance(pouchDb);
//   }
//
//   // TODO: создать инстанс
//
//   return this.dbInstances[dbName];
// }
//
// async hasDb(dbName: string): Promise<boolean> {
//
//   // TODO: не правильно !!! проверить саму базу
//
//   return Boolean(this.dbInstances[dbName]);
// }
//
// async createDb(dbName: string): Promise<void> {
//   // TODO: если база существует - то ошибка
//   // if (!this.dbInstances[dbName]) {
//   //   throw new Error(`Can't find pouch data base "${dbName}"`)
//   // }
//
//   const pouchDb = new PouchDB(dbName);
//
//   this.dbInstances[dbName] = new DbInstance(pouchDb);
// }
//
// async renameDb(dbName: string, newName: string): Promise<void> {
//
//   // TODO: do rename
//
// }
//
// async deleteDb(dbName: string): Promise<void> {
//   if (!this.dbInstances[dbName]) {
//     throw new Error(`Can't find pouch data base "${dbName}"`)
//   }
//
//   // TODO: cal delete pouch
//
//   // await db.destroy();
//
//   await this.dbInstances[dbName].destroy();
//
//   delete this.dbInstances[dbName];
// }
