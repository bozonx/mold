import PouchDB from 'pouchdb';

import {DbAdapterDbInstance, RecordChangeHandler} from '../../interfaces/DbAdapter';
import {MoldResponse} from '../../interfaces/MoldResponse';



// var db = new PouchDB('dbname');
//
// db.put({
//   _id: 'dave@gmail.com',
//   name: 'David',
//   age: 69
// });
//
// db.changes().on('change', function() {
//   console.log('Ch-Ch-Changes');
// });


export class DbInstance implements DbAdapterDbInstance {
  private readonly db: PouchDB;


  constructor(db: PouchDB) {
    this.db = db;
  }

  async destroy() {
    await this.db.close();
  }


  find(): Promise<MoldResponse> {}

  get(): Promise<MoldResponse> {}

  create(): Promise<void> {

  }

  update(): Promise<void> {}

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

  }

  removeListener(handlerIndex: number) {

  }

}
