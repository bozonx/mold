var PouchDB = require('pouchdb');
var _ = require('lodash');

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
    // TODO: может получать доступ к mold instance?
    this._schemaManager = schemaManager;
    this._state = state;
  }

  get(request, resolve, reject) {
    if (!request.pathToDocument)
      throw new Error(`PounchDb can't work without specified "document" in your schema!`);

    this._mainInstatnce.db.get(request.pathToDocument).then((resp) => {
      resolve({
        data: resp,
        successResponse: resp,
      });
    }).catch((err) => {
      reject({
        errorResponse: err,
      });
    });
  }

  set(request, resolve, reject) {
    // TODO: test arrays and collections

    if (!request.pathToDocument)
      throw new Error(`PounchDb can't work without specified "document" in your schema!`);

    this._mainInstatnce.db.get(request.pathToDocument).then((resp) => {
      this._mainInstatnce.db.put({
        ...resp,
        ...request.document,
      }).then((resp) => {
        resolve({
          data: resp,
          successResponse: resp,
        })
      }).catch((err) => {
        reject({
          errorResponse: err,
        })
      });
    }).catch((err) => {
      if (err.status == 404) {
        this._mainInstatnce.db.put({
          ...request.document,
          _id: request.pathToDocument,
        }).then((resp) => {

          resolve({
            data: resp,
            successResponse: resp,
          })
        }).catch((err) => {
          reject({
            errorResponse: err,
          })
        });
      }
      else {
        reject({
          errorResponse: err,
        });
      }
    });
  }

  add(request, resolve, reject) {
    // TODO:
  }

  remove(request, resolve, reject) {
    // TODO: test it
    // this._mainInstatnce.db.remove(request.path).then((doc) => {
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
    // TODO: Pounch настроенный брать из конфига
    this.db = new PouchDB('myDB', {db: require('memdown')});
  }

  /**
   * Schema helper
   * @param {object} localConfig
   * @param {object} schema
   * @returns {{driver: LocalPounchDb, schema: *}}
     */
  schema(localConfig, schema) {
    // TODO: передавать не ссылку на себя а базу и конфиг
    return {
      driver: new LocalPounchDb(this, localConfig),
      schema: schema,
    }
  }
}
