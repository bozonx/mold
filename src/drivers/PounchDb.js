import _ from 'lodash';

import { correctUpdatePayload } from '../helpers';

// TODO: add db.changes - при изменениях в базе поднимать событие или как-то самому менять значение

// TODO: можно умножит на произвольное число от 2 до 10
var createCount = 0;

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 10; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

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
   * It create or save(all fields) document.
   * @param {object} request
   * @returns {Promise}
   */
  put(request) {
    return new Promise((resolve, reject) => {
      this._db.get(request.url).then((resp) => {
        // full update
        let payload = {
          ..._.omit(request.payload, '_id', '_rev'),
          ..._.pick(resp, '_id', '_rev'),
        };

        // update
        this._db.put(payload).then((resp) => {
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

  /**
   * It patches existent document.
   * If document doesn't exist it rises an error.
   * @param {object} request
   * @returns {Promise}
   */
  patch(request) {
    return this._db.get(request.url).then((resp) => {
      let payload = correctUpdatePayload(resp, _.omit(request.payload, '_id', '_rev'));

      // update
      return this._db.put(payload).then((resp) => {
        //if (!resp.ok) reject(this._rejectHandler.bind(request, err));

        return {
          body: {
            ...payload,
            _id: resp.id,
            _rev: resp.rev,
          },
          driverResponse: resp,
          request,
        };
      }, this._rejectHandler.bind(this, request));
    }, this._rejectHandler.bind(this, request));
  }

  create(request) {
    // TODO: generate really uniq id!!!
    //let uniqPart = makeid();
    let uniqPart = createCount;
    let timePart = parseInt(moment().format('x'));
    let uniqId = '$id' + (timePart + uniqPart);
    let uniqDocId = `${request.url}/${uniqId}`;

    // TODO: можно умножать на произвольное число от 2 до 10
    createCount++;

    // TODO: get real secondary indexes from meta
    if (request.payload.created) {
      uniqDocId += `::${request.payload.created}`
    }

    // add id param
    var newValue = {
      ...request.payload,
      [request.primaryKeyName]: uniqId,
      _id: uniqDocId,
    };

    return this._db.put(newValue)
    .then((resp) => {
      return {
        body: {
          ...request.payload,
          _id: resp.id,
          _rev: resp.rev,
          [request.primaryKeyName]: uniqId,
        },
        driverResponse: resp,
        request,
      };
    }, this._rejectHandler.bind(this, request));

  }

  delete(request) {
    let docId = `${request.url}/${request.payload[request.primaryKeyName]}`;

    // first - find the element
    return this._db.get(docId).then((getResp) => {
      // remove item
      return this._db.remove(getResp).then((resp) => {
        return {
          body: undefined,
          driverResponse: resp,
          request,
        };
      }, this._rejectHandler.bind(this, request));
    }, this._rejectHandler.bind(this, request));
  }

  startRequest(request) {
    return this[request.method](request);
  }

  _rejectHandler(request, err) {
    // Return undefined if data hasn't found.
    // TODO: !!!!???
    // if (err.status == 404)
    //   return {
    //     driverError: err,
    //     request,
    //   };

    return {
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
