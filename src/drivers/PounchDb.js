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
   * @param {Main} main
   */
  init(root, main) {
    this._root = root;
    this._main = main;
  }

  get(request) {
    return this._db.get(request.url)
      .then((resp) => {
        return {
          body: resp,
          driverResponse: resp,
          request,
        };
      }, this._rejectHandler.bind(this, request));
  }

  filter(request) {
    var getAllQuery = {
      include_docs: true,
      startkey: request.url,
    };

    if (_.isNumber(request.meta.perPage) && _.isNumber(request.meta.pageNum)) {
      getAllQuery = {
        ...getAllQuery,
        // skip is slowly
        skip: request.meta.pageNum * request.meta.perPage,
        limit: (request.meta.pageNum + 1) * request.meta.perPage,
      }
    }

    return this._db.allDocs(getAllQuery)
      .then((resp) => {
        return {
          body: _.map(resp.rows, value => value.doc),
          driverResponse: resp,
          request,
        }
      }, this._rejectHandler.bind(this, request));
  }

  /**
   * It patches existent document.
   * If document doesn't exist it rises an error.
   * @param {object} request
   * @returns {Promise}
   */
  patch(request) {
    // TODO: remake it - нужно чтобы патчило!!!
    return new Promise((resolve, reject) => {
      this._db.get(request.url).then((resp) => {
        // update
        this._db.put({
          ...resp,
          ..._.omit(request.payload, '_rev'),
        })
          .then((resp) => {
            if (!resp.ok) reject(this._rejectHandler.bind(request, err));

            resolve({
              body: {
                ...request.payload,
                _id: resp.id,
                _rev: resp.rev,
              },
              driverResponse: resp,
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
          _id: request.url,
        })
          .then((resp) => {
            if (!resp.ok) reject(this._rejectHandler.bind(request, err));

            resolve({
              body: {
                ...request.payload,
                _id: resp.id,
                _rev: resp.rev,
              },
              driverResponse: resp,
              request,
            });
          }, (err) => {
            reject(this._rejectHandler.bind(request, err));
          });
      });
    });
  }

  create(request) {
    var getAllQuery = {
      include_docs: true,
      startkey: request.url,
    };

    // TODO: не использовать allDocs!!!! надо генерировать ключ
    return this._db.allDocs(getAllQuery).then((getAllResp) => {
      var primaryId = 0;

      // TODO: не использовать id из payload - всегда генерировать!!!!
      if (_.isNumber(request.payload[request.primaryKeyName])) {
        // use id from payload
        primaryId = request.payload[request.primaryKeyName];
      }
      else if (!_.isEmpty(getAllResp.rows)) {
        // increment id
        primaryId = _.last(getAllResp.rows).doc[request.primaryKeyName] + 1;
      }

      // add id param
      var newValue = {
        ...request.payload,
        [request.primaryKeyName]: primaryId,
        _id: `${request.url}/${primaryId}`,
      };

      return this._db.put(newValue)
        .then((resp) => {
          return {
            body: {
              ...request.payload,
              _id: resp.id,
              _rev: resp.rev,
              id: primaryId,
            },
            driverResponse: resp,
            request,
          };
        }, this._rejectHandler.bind(this, request));

    }, this._rejectHandler.bind(this, request));

  }

  delete(request) {
    let docId = `${request.url}/${request.payload[request.primaryKeyName]}`;

    // first - find the element
    // TODO: наверное db.get не нужен
    return this._db.get(docId).then((getResp) => {
      // remove item
      return this._db.remove(getResp).then((resp) => {
        return {
          body: undefined,
          driverResponse: resp,
          request,
        };
      }, (err) => {
        return ({
          driverError: err,
          request,
        });
      });
    }, (err) => {
      return this._rejectHandler(request, err);
    });
  }

  startRequest(request) {
    return this[request.method](request);
  }

  _rejectHandler(request, err) {
    // Return undefined if data hasn't found.
    if (err.status == 404)
      return {
        driverError: err,
        request,
      };

    throw {
      driverError: err,
      request,
    };
  }
}

/**
 * Instance of this class creates once a mold instance
 */
export default function(driverConfig) {
  this.driverConfig = driverConfig;

  if (!driverConfig.db)
    throw new Error(`The "db" field in config is required!`);

  this.db = driverConfig.db;

  /**
   * Get instance
   * @param {object} instanceConfig
   * @returns {LocalPounchDb}
   */
  this.instance = (instanceConfig) => {
    return new LocalPounchDb(this.driverConfig, instanceConfig, this.db);
  };

}
