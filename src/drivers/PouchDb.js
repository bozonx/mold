import _ from 'lodash';
import moment from 'moment';

import { correctUpdatePayload } from '../helpers';

// from 0 to 19
let uniqCreatedId = Math.floor(Math.random() * 20);

// function makeid() {
//   var text = "";
//   var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//
//   for( var i=0; i < 10; i++ )
//     text += possible.charAt(Math.floor(Math.random() * possible.length));
//
//   return text;
// }

class LocalPouchDb {
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
    const usePaged = _.isNumber(request.meta.perPage) && _.isNumber(request.meta.pageNum);
    const preparedUrl = _.trimEnd(request.url, '/') + '/';
    const preparedUrl222 = _.trimEnd(request.url, '/');
    // simple query without paging
    let query = {
      include_docs: true,
    };

    // TODO: убрать meta.descending - это параметр sort

    // if (request.meta.descending) {
    //   query = {
    //     ...query,
    //     startkey: preparedUrl + '\uffff',
    //     endkey: preparedUrl,
    //     descending: true,
    //   }
    // }
    // else {
    //   query = {
    //     ...query,
    //     startkey: preparedUrl,
    //     // \uffff - is high character
    //     endkey: preparedUrl + '\uffff',
    //     descending: false,
    //   }
    // }


    // TODO: указываем запрос только если не передан свыше

    query = {
      ...query,
      selector: {
        // _id: {
        //   $elemMatch: {
        //     //$regex: "^\/blog\/",
        //     $regex: preparedUrl,
        //   }
        // },
        // body: {$gt: null},
        $parent: {$eq: preparedUrl222}
      },
      //sort: ['$parent', {'$id': 'desc'}],
    };

    if (usePaged) {
      query = {
        ...query,
        // skip is slowly
        skip: request.meta.pageNum * request.meta.perPage,
        limit: request.meta.perPage,
      }
    }

    return this._db.find(query)
      .then((resp) => {
        const response = {
          body: resp.docs,
          driverResponse: resp,
          request,
        };
        if (usePaged) {
          const lastItemIndex = (request.meta.pageNum + 1) * request.meta.perPage;
          response.meta = {
            pageNum: request.meta.pageNum,
            // TODO: как теперь подсчитать????
            //lastPage: lastItemIndex >= resp.total_rows,
            // TODO: не очень правильно
            lastPage: resp.docs.length < request.meta.perPage,
          };
        }
        return response;
      }, this._rejectHandler.bind(this, request));
  }

  /**
   * It create or save(all fields) document.
   * It doesn't generate id, it uses whole url.
   * @param {object} request
   * @returns {Promise}
   */
  put(request) {
    const sendPut = (payload, resolve, reject) => {
      return this._db.put(payload).then((resp) => {
        //if (!resp.ok) reject(this._rejectHandler.bind(request, err));

        resolve({
          body: {
            ...payload,
            _id: resp.id,
            _rev: resp.rev,
          },
          driverResponse: resp,
          request,
        });
      }, (err) => {
        reject(this._rejectHandler(request, err));
      });
    };

    return new Promise((resolve, reject) => {
      // get first because we need to '_rev' for update document
      this._db.get(request.url).then((resp) => {
        // full update
        const payload = {
          ..._.omit(request.payload, '_id', '_rev', '$root'),
          ..._.pick(resp, '_id', '_rev', '$root'),
        };

        // update
        sendPut(payload, resolve, reject);
      }, (err) => {
        if (err.status != 404)
          return reject(this._rejectHandler(request, err));

        const payload = {
          ...request.payload,
          _id: request.url,
          $url: request.url,
        };

        sendPut(payload, resolve, reject);
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
      const payload = correctUpdatePayload(resp, _.omit(request.payload, '_id', '_rev'));

      // update
      return this._db.put(payload).then((resp) => {
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

  /**
   * Create new item.
   * It generates an uniq id.
   * @param {object} request
   * @returns {Promise}
   */
  create(request) {
    const timePart = parseInt(moment().format('x'));
    const itemId = timePart + uniqCreatedId;
    const uniqDocId = `${request.url}/${itemId}`;
    // increment by random int from 1 to 10
    uniqCreatedId += Math.ceil(Math.random() * 10);

    const payload = {
      ...request.payload,
      [request.primaryKeyName]: itemId,
      _id: uniqDocId,
      $parent: request.url,
      $url: uniqDocId,
      $id: itemId,
    };

    return this._db.put(payload)
    .then((resp) => {
      return {
        body: {
          ...request.payload,
          _id: resp.id,
          _rev: resp.rev,
          [request.primaryKeyName]: itemId,
        },
        driverResponse: resp,
        request,
      };
    }, this._rejectHandler.bind(this, request));
  }

  delete(request) {
    const docId = `${request.url}/${request.payload[request.primaryKeyName]}`;

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
    return Promise.reject({
      driverError: err,
      request,
    });
  }
}

/**
 * Instance of this class creates once a mold instance
 */
export default function(driverConfig) {
  this.driverConfig = driverConfig;

  if (!driverConfig.db)
    this._main.$$log.fatal(`The "db" field in config is required!`);

  this.db = driverConfig.db;

  /**
   * Get instance
   * @param {object} instanceConfig
   * @returns {LocalPouchDb}
   */
  this.instance = (instanceConfig) => {
    return new LocalPouchDb(this.driverConfig, instanceConfig, this.db);
  };

}
