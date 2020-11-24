import PouchDB from 'pouchdb';

import {DbAdapter, RecordChangeHandler} from '../interfaces/DbAdapter';
import {MoldResponse} from '../interfaces/MoldResponse';
import {CreateResponse, ItemResponse, ListResponse} from '../frontend/interfaces/MethodsState';
import {makeUniqId} from '../helpers/uniqId';


interface FindSuccess {
  offset: number;
  length: number;
  // the total number of non-deleted documents in the database
  total_rows: number;
  rows: {id: "root/1", key: "root/1", value: Record<string, any>}[];
}

interface GetSuccess {
  _id: string;
  _rev: string;
  [index: string]: any;
}

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
        //limit: 1,
        //skip: 1,
        ...meta,
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
        data: result.rows.map((item) => item.value),
      },
    }

    /*
      $mold.props.backends.default.adapter.db.allDocs({startkey: 'root/'})

      success
      {
      offset: 0
      rows: Array(1)
        0: {id: "root/1", key: "root/1", value: {…}}
      length: 1
      total_rows: 1
      }

      если не найдет ничего то
      {
      offset: 0
      rows: Array(0)
      length: 0
      __proto__: Array(0)
      total_rows: 1
      }
     */

    // return new Promise((resolve) => {
    //   setTimeout(() => {
    //     resolve({
    //       status: 200,
    //       errors: null,
    //       success: true,
    //       result: {
    //         count: 0,
    //         hasNext: false,
    //         hasPrev: false,
    //         data: [
    //           { name: 'fff' }
    //         ]
    //       },
    //     })
    //   }, 2000)
    // });
  }

  async get(
    set: string,
    id: string | number,
    meta?: Record<string, any>
  ): Promise<MoldResponse<ItemResponse>> {
    let result: GetSuccess;

    try {
      result = await this.db.get({
        _id: set + SET_DELIMITER + id,
      }, meta);
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

    /*
     on success
     {
      param: 1
      _id: "settings"
      _rev: "1-9bb7a96644a280d92dda8ef556d10300"
      }

      on error
      {
      docId: "settings1"
      error: true
      message: "missing"
      name: "not_found"
      reason: "missing"
      status: 404
      }
     */

    // return new Promise((resolve) => {
    //   setTimeout(() => {
    //     resolve({
    //       status: 200,
    //       errors: null,
    //       success: true,
    //       result: { data: {name: 'fff'} },
    //     })
    //   }, 2000)
    // });
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
        ...data,
      }, meta);
    }
    catch (e) {
      return this.makeErrorResponse(e);
    }

    return {
      status: 200,
      success: true,
      errors: null,
      result: {
        id: result.id,
        _rev: result.rev,
      },
    }

    /*
    put returns

    on success
    {
    id: "settings"
    ok: true
    rev: "1-9bb7a96644a280d92dda8ef556d10300"
    }

    on error - в reject промиса
    {
    error: true
    message: "_id is required for puts"
    name: "missing_id"
    status: 412
    }

     */
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
      }, meta);
    }
    catch (e) {
      return this.makeErrorResponse(e);
    }

    return {
      status: 200,
      success: true,
      errors: null,
      result: {
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
      result = await this.db.remove(getResult, meta);
    }
    catch (e) {
      return this.makeErrorResponse(e);
    }

    return {
      status: 200,
      success: true,
      errors: null,
      result: {
        id: result.id,
        _rev: result.rev,
      },
    }

    /*
    $mold.props.backends.default.adapter.db.remove({_id: 'settings', _rev: "1-9bb7a96644a280d92dda8ef556d10300"})

    on success {
      id: "settings"
      ok: true
      rev: "4-5b2d40d2b2902a0926ab21afb9380243"
    }

    on error
    {
    docId: undefined
    error: true
    id: undefined
    message: "missing"
    name: "not_found"
    reason: "deleted"
    status: 404
    }
    {
    docId: "settings"
    error: true
    id: "settings"
    message: "Document update conflict"
    name: "conflict"
    status: 409
    }

     */
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
