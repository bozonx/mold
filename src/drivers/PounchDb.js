//import _ from 'lodash';

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

  get(request) {
    if (!request.pathToDocument)
      throw new Error(`PounchDb can't work without specified "document" in your schema!`);

    return this._db.get(request.pathToDocument)
      .then(this._resolveHandler.bind(this, request), this._rejectHandler.bind(this, request));
  }

  set(request) {
    // TODO: !!!!! пересмотреть

    if (!request.pathToDocument)
      throw new Error(`PounchDb can't work without specified "document" in your schema!`);

    return new Promise((resolve, reject) => {
      this._db.get(request.pathToDocument).then((resp) => {
        // update
        this._db.put({
          ...resp,
          ...request.document,
        })
          .then((resp) => {
            resolve(this._resolveHandler(request, resp));
          }, (err) => {
            reject(this._rejectHandler.bind(request, err));
          });
      }).catch((err) => {
        if (err.status != 404)
          return reject(this._rejectHandler.bind(request, err));

        // create
        this._db.put({
          ...request.document,
          _id: request.pathToDocument,
        })
          .then((resp) => {
            resolve(this._resolveHandler(request, resp));
          }, (err) => {
            reject(this._rejectHandler.bind(request, err));
          });
      });
    });
  }

  add(request) {
    // TODO: !!!!! пересмотреть
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
        return this._db.put({
          ...request.document,
          [request.primaryKeyName]: 0,
          _id: `${request.pathToDocument}{0}`,
        })
        .then(this._resolveHandler.bind(this, request), this._rejectHandler.bind(this, request));
      }

    }).catch(this._rejectHandler.bind(this, request));
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

  requestHandler(request) {
    return this[request.type](request);
  }

  _resolveHandler(request, resp) {
    return {
      payload: resp,
      successResponse: resp,
      request,
    };
  }

  _rejectHandler(request, err) {
    // Return undefined if data hasn't found.
    if (err.status == 404)
      return {
        errorResponse: err,
        request,
      };

    throw {
      errorResponse: err,
      request,
    };
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
