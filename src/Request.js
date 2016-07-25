// It's runtime state manager
import _ from 'lodash';

import { findPrimary, splitLastParamPath } from './helpers';

export default class Request {
  constructor(main) {
    this._main = main;

    // this._addedUnsavedItems = {};
    // this._removedUnsavedItems = {};
    //
    // this._initComposition();
  }

  loadPrimitive(pathToPrimitive, cb) {
    return new Promise((resolve, reject) => {
      var splits = splitLastParamPath(pathToPrimitive);
      var basePath = splits.basePath;
      var paramPath = splits.paramPath;

      this._startDriverRequest({ method: 'get', fullPath: basePath }).then((resp) => {
        // TODO: пересмотреть пути

        // unwrap primitive value from container
        var preparedResponse = {
          ...resp,
          coocked: _.get(resp.coocked, paramPath)
        };

        cb(pathToPrimitive, preparedResponse);

        resolve(preparedResponse);
      }, reject);
    });
  }

  loadContainer(pathToContainer, cb) {
    return new Promise((resolve, reject) => {
      this._startDriverRequest({ method: 'get', fullPath: pathToContainer, }).then((resp) => {
        // TODO: пересмотреть пути
        //var pathTo = resp.request.pathToDocument || resp.request.fullPath;
        // TODO: формировать путь pathToDocument + путь внутненнего параметра
        var pathTo = resp.request.fullPath;

        cb(pathTo, resp);

        resolve(resp);
      }, reject);
    });
  }

  loadCollection(pathToCollection, cb) {
    return new Promise((resolve, reject) => {
      this._startDriverRequest({ method: 'filter', fullPath: pathToCollection }).then((resp) => {
        // TODO: пересмотреть пути
        var pathTo = resp.request.pathToDocument || resp.request.fullPath;

        cb(pathTo, resp);

        resolve(resp);
      }, reject);
    });
  }

  savePrimitive() {

  }

  saveContainer() {

  }
  
  saveCollection(pathToCollection, addedUnsavedItems, removedUnsavedItems) {

    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(pathToCollection);

    var primaryKeyName = findPrimary(schema.item);

    return new Promise((mainResolve) => {
      var promises = [
        ...this._saveUnsaved(addedUnsavedItems, pathToCollection, {method: 'add', primaryKeyName}, (unsavedItem, resp) => {
          _.extend(unsavedItem, resp.coocked);
        }),
        ...this._saveUnsaved(removedUnsavedItems, pathToCollection, {method: 'remove', primaryKeyName}),
      ];

      Promise.all(promises).then(results => {
        mainResolve(results);
      });
    });
  }


  _saveUnsaved(unsavedList, pathToCollection, rawQuery, successCb) {
    var promises = [];
    _.each(_.reverse(unsavedList[pathToCollection]), (unsavedItem) => {
      // skip empty
      if (_.isUndefined(unsavedItem)) return;

      var payload = _.omit(_.cloneDeep(unsavedItem), '$index', '$isNew', '$unsaved');

      // remove item from unsaved list
      _.remove(unsavedList[pathToCollection], unsavedItem);
      if (_.isEmpty(unsavedList[pathToCollection])) delete unsavedList[pathToCollection];

      promises.push(new Promise((resolve) => {
        this._startDriverRequest({
          ...rawQuery,
          fullPath: pathToCollection,
          payload: payload,
        }).then((resp) => {
          if (successCb) successCb(unsavedItem, resp);

          delete unsavedItem.$isNew;

          resolve({
            path: pathToCollection,
            isOk: true,
            resp,
          });
        }, (error) => {
          // on error make item unsaved again
          if (_.isUndefined(unsavedList[pathToCollection])) unsavedList[pathToCollection] = [];
          unsavedList[pathToCollection].push(unsavedItem);

          resolve({
            path: pathToCollection,
            isOk: false,
            error,
          });
        });
      }));
    });

    return promises;
  }

  /**
   * Send query to driver for data.
   * @param {{method: string, fullPath: string, payload: *}} rawRequest
   *     * method is one of: get, set, filter, add, remove
   *     * fullPath: full path in mold
   *     * payload: for "set" and "add" methods - value to set
   * @returns {Promise}
   * @private
   */
  _startDriverRequest(rawRequest) {
    var driver = this._main.schemaManager.getDriver(rawRequest.fullPath);

    if (!driver)
      throw new Error(`No-one driver did found!!!`);

    // TODO: разобраться с путями
    var req = _.clone(rawRequest);
    var documentParams = this._main.schemaManager.getDocument(rawRequest.fullPath);
    if (documentParams) {
      req['documentParams'] = documentParams;
      req['pathToDocument'] = documentParams.pathToDocument;
    }

    return driver.requestHandler(req);
  }


}
