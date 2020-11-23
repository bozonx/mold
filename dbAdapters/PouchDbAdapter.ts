import PouchDB from 'pouchdb';

import DbAdapter, {RecordChangeHandler} from '../interfaces/DbAdapter';
import MoldRequest from '../interfaces/MoldRequest';
import {MoldResponse} from '../interfaces/MoldResponse';


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


export default class PouchDbAdapter implements DbAdapter {
  private pouch: typeof PouchDB;


  constructor(pouch: typeof PouchDB) {
    this.pouch = pouch;
  }


  find(request: MoldRequest): Promise<MoldResponse> {}

  get(request: MoldRequest): Promise<MoldResponse> {}

  create(request: MoldRequest): Promise<void> {

  }

  update(request: MoldRequest): Promise<void> {}

  delete(request: MoldRequest): Promise<void> {}

  getTable(): Promise<void> {}
  createTable(): Promise<void> {}
  renameTable(): Promise<void> {}
  deleteTable(): Promise<void> {}

  getDb(): Promise<void> {}
  createDb(): Promise<void> {}
  renameDb(): Promise<void> {}
  deleteDb(): Promise<void> {}

  onRecordChange(cb: RecordChangeHandler): number {

  }

  removeListener(handlerIndex: number) {

  }
}
