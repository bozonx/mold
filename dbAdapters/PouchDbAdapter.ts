import PouchDB from 'pouchdb';

import {DbAdapter, RecordChangeHandler} from '../interfaces/DbAdapter';
import {MoldResponse} from '../interfaces/MoldResponse';
import {ItemResponse, ListResponse} from '../frontend/interfaces/MethodsState';


export default class PouchDbAdapter implements DbAdapter {
  private db: PouchDB;


  constructor(db: typeof PouchDB) {
    this.db = db;
  }

  async destroy(): Promise<void> {
    // await Promise.all(Object.keys(this.dbInstances).map((dbName: string): Promise<void> => {
    //   return this.dbInstances[dbName].destroy();
    // }))
    //   .then();
    //
    // this.dbInstances = {};
  }

  find(
    set: string,
    query: Record<string, any>,
    meta?: Record<string, any>
  ): Promise<MoldResponse<ListResponse>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 200,
          errors: null,
          success: true,
          result: {
            data: [
              { name: 'fff' }
            ]
          } as any,
        })
      }, 2000)
    });
  }

  get(
    set: string,
    id: string | number,
    query: Record<string, any>,
    meta?: Record<string, any>
  ): Promise<MoldResponse<ItemResponse>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 200,
          errors: null,
          success: true,
          result: { name: 'fff' },
        })
      }, 2000)
    });
  }

  create(
    set: string,
    data: Record<string, any>,
    meta?: Record<string, any>
  ): Promise<void> {

  }

  patch(
    set: string,
    id: string | number,
    partialData: Record<string, any>,
    meta?: Record<string, any>
  ): Promise<void> {}

  delete(): Promise<void> {}

  getField(): Promise<void> {}
  hasField(): Promise<boolean> {}
  createField(): Promise<void> {}
  updateField(): Promise<void> {}
  deleteField(): Promise<void> {}

  getTable(): Promise<void> {}
  hasTable(): Promise<boolean> {}
  createTable(): Promise<void> {}
  renameTable(): Promise<void> {}
  deleteTable(): Promise<void> {}

  onRecordChange(cb: RecordChangeHandler): number {
    // TODO: add
  }

  removeListener(handlerIndex: number) {

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
