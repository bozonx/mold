import _ from 'lodash';

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
      // TODO: проверять documentParams
      throw new Error(`PounchDb can't work without specified "pathToDocument" in your schema!`);

    return this._db.get(request.pathToDocument)
      .then(this._resolveHandler.bind(this, request), this._rejectHandler.bind(this, request));
  }

  set(request) {
    if (!request.pathToDocument)
    // TODO: проверять documentParams
      throw new Error(`PounchDb can't work without specified "pathToDocument" in your schema!`);

    return new Promise((resolve, reject) => {
      this._db.get(request.pathToDocument).then((resp) => {
        // update
        this._db.put({
          ...resp,
          ...request.payload,
        })
          .then((resp) => {
            if (!resp.ok) reject(this._rejectHandler.bind(request, err));

            resolve({
              coocked: {
                ...request.payload,
                _id: resp.id,
                _rev: resp.rev,
              },
              successResponse: resp,
              request,
            });
          }, (err) => {
            reject(this._rejectHandler.bind(request, err));
          });
      }).catch((err) => {
        if (err.status != 404)
          return reject(this._rejectHandler.bind(request, err));

        // create
        this._db.put({
          ...request.payload,
          _id: request.pathToDocument,
        })
          .then((resp) => {
            if (!resp.ok) reject(this._rejectHandler.bind(request, err));

            resolve({
              coocked: {
                ...request.payload,
                _id: resp.id,
                _rev: resp.rev,
              },
              successResponse: resp,
              request,
            });
          }, (err) => {
            reject(this._rejectHandler.bind(request, err));
          });
      });
    });
  }

  add(request) {
    if (!request.pathToDocument)
      throw new Error(`PounchDb can't work without specified "pathToDocument" in your schema!`);

    var getAllQuery = {
      include_docs: true,
      //startKey: request.pathToDocument,
      // TODO: проверить будет ли выбирать все дочерние
      key: request.pathToDocument,
    };

    console.log(111111, request)


    return new Promise((resolve, reject) => {
      this._db.allDocs(getAllQuery).then((getAllResp) => {
        var primaryId = 0;

        console.log(2222, getAllResp)

        if (!_.isEmpty(getAllResp.rows)) {
          console.log(33333, _.last(getAllResp.rows))
          primaryId = _.last(getAllResp.rows).doc[request.primaryKeyName] + 1;
        }

        console.log(7777, primaryId)

        this._db.put({
            ...request.payload,
            [request.primaryKeyName]: primaryId,
            // TODO: какой должен быть формат .0. или {0} ?
            _id: `${request.pathToDocument}.${primaryId}`,
          })
          .then((resp) => {
            resolve({
              coocked: {
                ...request.payload,
                _id: resp.id,
                _rev: resp.rev,
                id: primaryId,
              },
              successResponse: resp,
              request,
            });
          }, (err) => {
            reject(this._rejectHandler(request, err));
          });

      }).catch((err) => {
        reject(this._rejectHandler.bind(request, err))
      });
    });


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
    return this[request.method](request);
  }

  _resolveHandler(request, resp) {
    return {
      coocked: resp,
      successResponse: resp,
      request,
    };
  }

  _rejectHandler(request, err) {
    // Return undefined if data hasn't found.
    if (err.status == 404)
      return {
        error: err,
        request,
      };

    throw {
      error: err,
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
