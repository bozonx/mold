var PouchDB = require('pouchdb');
var _ = require('lodash');

var remoteCouch = false;

// TODO: add db.changes - при изменениях в базе поднимать событие или как-то самому менять значение

class LocalPounchDb {
  constructor(mainInstatnce, localConfig) {
    this._mainInstatnce = mainInstatnce;
    this._localConfig = localConfig;
  }

  /**
   * It runs on schema init.
   * @param {string} root - absolute root in main schema
   * @param {object} schemaManager
   * @param {object} state
   */
  init(root, schemaManager, state) {
    this._root = root;
    this._schemaManager = schemaManager;
    this._state = state;

    // TODO: Does it need a main events object?

    // Listen all data manipulation events
    // this._events.on('data', (event) => {
    //   if (event.method == 'set') {
    //     // ...
    //   }
    // })
  }

  get(request, resolve, reject) {
    // TODO: test it
    // TODO: test arrays and collections
    
    if (!request.pathToDocument)
      throw new Error(`PounchDb can't work without specified document in your schema!`);
    
    this._mainInstatnce.db.get(request.pathToDocument).then(function (pounchResponse) {
      console.log(111111111, pounchResponse)
      resolve({
        //data: doc,
        successResponse: pounchResponse,
      });
    }).catch(function (pounchError) {
      reject({
        errorResponse: pounchError,
      });
    });
  }

  set(request, resolve, reject) {
    // TODO: test arrays and collections

    if (!request.pathToDocument)
      throw new Error(`PounchDb can't work without specified document in your schema!`);

    this._mainInstatnce.db.put({
      ...request.document,
      _id: request.pathToDocument,
    }).then((pounchResponse) => {
      resolve({
        successResponse: pounchResponse,
      })
    }).catch((pounchError) => {
      reject({
        errorResponse: pounchError,
      })
    });
  }

  add(request, resolve, reject) {
    // TODO:
  }

  remove(request, resolve, reject) {
    // TODO: test it
    // this._mainInstatnce.db.remove(request.path).then(function (doc) {
    //   resolve({
    //     data: doc,
    //   });
    // }).catch(function (err) {
    //   reject(err);
    // });
  }

  requestHandler(request, resolve, reject) {
    this[request.type](request, resolve, reject);
  }

}

export default class PounchDb {
  constructor(mainConfig) {
    this.mainConfig = mainConfig;
    // TODO: брать из конфига root - чтобы обрезать path
    // TODO: имя базы из конфига
    this.db = new PouchDB('myDB', {db: require('memdown')});
  }

  /**
   * Schema helper
   * @param {object} localConfig
   * @param {object} schema
   * @returns {{driver: LocalPounchDb, schema: *}}
     */
  schema(localConfig, schema) {
    return {
      driver: new LocalPounchDb(this, localConfig),
      schema: schema,
    }
  }
}
