import PouchDB from 'pouchdb';

import {DbAdapter, DbAdapterDbInstance} from '../../interfaces/DbAdapter';
import {DbInstance} from './DbInstance';


export default class PouchDbAdapter implements DbAdapter {
  private pouch: typeof PouchDB;
  // object like { dbName: dbInstance }
  private dbInstances: Record<string, DbAdapterDbInstance> = {};


  constructor(pouch: typeof PouchDB) {
    this.pouch = pouch;
  }

  async destroy(): Promise<void> {
    await Promise.all(Object.keys(this.dbInstances).map((dbName: string): Promise<void> => {
      return this.dbInstances[dbName].destroy();
    }))
      .then();

    this.dbInstances = {};
  }


  async getDb(dbName: string): Promise<DbAdapterDbInstance> {
    if (!this.dbInstances[dbName]) {

      // TODO: если база не существует то ошибка

      const pouchDb = new PouchDB(dbName);

      this.dbInstances[dbName] = new DbInstance(pouchDb);
    }

    // TODO: создать инстанс

    return this.dbInstances[dbName];
  }

  async hasDb(dbName: string): Promise<boolean> {

    // TODO: не правильно !!! проверить саму базу

    return Boolean(this.dbInstances[dbName]);
  }

  async createDb(dbName: string): Promise<void> {
    // TODO: если база существует - то ошибка
    // if (!this.dbInstances[dbName]) {
    //   throw new Error(`Can't find pouch data base "${dbName}"`)
    // }

    const pouchDb = new PouchDB(dbName);

    this.dbInstances[dbName] = new DbInstance(pouchDb);
  }

  async renameDb(dbName: string, newName: string): Promise<void> {

    // TODO: do rename

  }

  async deleteDb(dbName: string): Promise<void> {
    if (!this.dbInstances[dbName]) {
      throw new Error(`Can't find pouch data base "${dbName}"`)
    }

    // TODO: cal delete pouch

    // await db.destroy();

    await this.dbInstances[dbName].destroy();

    delete this.dbInstances[dbName];
  }

}
