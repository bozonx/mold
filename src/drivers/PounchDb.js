var PouchDB = require('pouchdb');
var _ = require('lodash');

// TODO: add db.changes - при изменениях в базе поднимать событие или как-то самому менять значение

class LocalPounchDb {
  constructor(driverConfig, instanceConfig, db) {
    this._driverConfig = driverConfig;
    this._instanceConfig = instanceConfig;
    this._db = db;
  }

  /**
   * It runs on schema init.
   * @param {string} root - absolute root in main schema
   * @param {MoldInstance} schemaManager
   */
  init(root, main) {
    this._root = root;
    this._main = main;
  }

  get(request, resolve, reject) {
    if (!request.pathToDocument)
      throw new Error(`PounchDb can't work without specified "document" in your schema!`);

    this._db.get(request.pathToDocument)
      .then(this._resolveHandler.bind(this, resolve), this._rejectHandler.bind(this, reject));
  }

  set(request, resolve, reject) {
    // TODO: test arrays and collections

    if (!request.pathToDocument)
      throw new Error(`PounchDb can't work without specified "document" in your schema!`);

    this._db.get(request.pathToDocument).then((resp) => {
      this._db.put({
        ...resp,
        ...request.document,
      })
        .then(this._resolveHandler.bind(this, resolve), this._rejectHandler.bind(this, reject));
    }).catch((err) => {
      if (err.status != 404)
        this._rejectHandler(reject, err);

      this._db.put({
        ...request.document,
        _id: request.pathToDocument,
      })
        .then(this._resolveHandler.bind(this, resolve), this._rejectHandler.bind(this, reject));
    });
  }

  add(request, resolve, reject) {
    // TODO:
  }

  remove(request, resolve, reject) {
    // TODO: test it
    // this._db.remove(request.path).then((doc) => {
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

  _resolveHandler(resolve, resp) {
    resolve({
      data: resp,
      successResponse: resp,
    });
  }

  _rejectHandler(reject, err) {
    reject({
      errorResponse: err,
    })
  }
}

/**
 * Instance of this class creates once a mold instance
 */
export default class PounchDb {
  constructor(driverConfig) {
    this.driverConfig = driverConfig;
    // TODO: брать из конфига root - чтобы обрезать path
    // TODO: имя базы из конфига
    // TODO: Pounch настроенный брать из конфига
    this.db = new PouchDB('myDB', {db: require('memdown')});
  }

  /**
   * Schema helper
   * @param {object} instanceConfig
   * @param {object} schema
   * @returns {{driver: LocalPounchDb, schema: *}}
     */
  schema(instanceConfig, schema) {
    return {
      driver: new LocalPounchDb(this.driverConfig, instanceConfig, this.db),
      schema: schema,
    }
  }
}
