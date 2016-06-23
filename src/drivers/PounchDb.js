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
   * @param {MoldInstance} main
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
    // TODO: test arrays

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

  find(request, resolve, reject) {
    // TODO:
  }

  filter(request, resolve, reject) {
    // TODO:
  }

  add(request, resolve, reject) {
    // TODO:
    if (!request.pathToDocument)
      throw new Error(`PounchDb can't work without specified "document" in your schema!`);

    var query = {
      include_docs: true,
      startKey: 'commonBranch.inPounch.docColl',
    };

    console.log(22222222, request)

    this._db.allDocs(query).then((resp) => {

      console.log(111111111, resp)

      if (resp.total_rows) {
        // add to existing collection
        // this._db.put({
        //     ...resp,
        //     ...request.document,
        //   })
        //   .then(this._resolveHandler.bind(this, resolve), this._rejectHandler.bind(this, reject));

      }
      else {
        // create new collection
        this._db.put({
          ...request.document,
          [request.primaryKeyName]: 0,
          _id: `${request.pathToDocument}{0}`,
        })
        .then(this._resolveHandler.bind(this, resolve), this._rejectHandler.bind(this, reject));
      }

    }).catch(this._rejectHandler.bind(this, reject));
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
      payload: resp,
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
export default function(driverConfig) {
  this.driverConfig = driverConfig;
  // TODO: брать из конфига root - чтобы обрезать path

  if (!driverConfig.db)
    throw new Error(`The "db" field in config is required!`);

  this.db = driverConfig.db;

  /**
   * Schema helper
   * @param {object} instanceConfig
   * @param {object} schema
   * @returns {{driver: LocalPounchDb, schema: *}}
   */
  this.schema = (instanceConfig, schema) => {
    return {
      driver: new LocalPounchDb(this.driverConfig, instanceConfig, this.db),
      schema: schema,
    }
  }
}
