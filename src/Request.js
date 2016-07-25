// It's runtime state manager
import _ from 'lodash';

import { findPrimary, splitLastParamPath } from './helpers';

export default class Request {
  constructor(main, composition) {
    this._main = main;
    // TODO: поидее класс ничего не должен знать о composition
    this._composition = composition;

    this._addedUnsavedItems = {};
    this._removedUnsavedItems = {};
  }

  addUnsavedAddedItem(pathToCollection, item) {
    if (!this._addedUnsavedItems[pathToCollection])
      this._addedUnsavedItems[pathToCollection] = [];

    this._addedUnsavedItems[pathToCollection].push(item);
  }

  addUnsavedRemovedItem(pathToCollection, item) {
    if (!this._removedUnsavedItems[pathToCollection])
      this._removedUnsavedItems[pathToCollection] = [];

    this._removedUnsavedItems[pathToCollection].push(item);
  }

  loadPrimitive(pathToPrimitive) {
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

        this._composition.update(pathToPrimitive, preparedResponse.coocked);

        resolve(preparedResponse);
      }, reject);
    });
  }

  loadContainer(pathToContainer) {
    return new Promise((resolve, reject) => {
      this._startDriverRequest({ method: 'get', fullPath: pathToContainer, }).then((resp) => {
        // TODO: пересмотреть пути
        //var pathTo = resp.request.pathToDocument || resp.request.fullPath;
        // TODO: формировать путь pathToDocument + путь внутненнего параметра
        var pathTo = resp.request.fullPath;

        this._composition.update(pathTo, resp.coocked);

        resolve(resp);
      }, reject);
    });
  }

  loadCollection(pathToCollection) {
    return new Promise((resolve, reject) => {
      this._startDriverRequest({ method: 'filter', fullPath: pathToCollection }).then((resp) => {
        // TODO: пересмотреть пути
        var pathTo = resp.request.pathToDocument || resp.request.fullPath;

        this._composition.update(pathTo, resp.coocked);

        resolve(resp);
      }, reject);
    });
  }

  savePrimitive(pathToPrimitive) {
    // TODO: rise an event - saved
    var isPrimitive = false;
    var paramPath;

    var pathToContainer;

    isPrimitive = true;
    // If it is a primitive, get container upper on path
    let split = splitLastParamPath(pathToPrimitive);
    paramPath = split.paramPath;

    if (_.isUndefined(split.paramPath))
    // TODO: это должно проверяться ещё на стадии валидации схемы.
      throw new Error(`Something wrong with your schema. Root of primitive must be a container.`);

    pathToContainer = split.basePath;
    if (this._main.schemaManager.get(pathToContainer).type) {
      // TODO: это должно проверяться ещё на стадии валидации схемы.
      throw new Error(`Something wrong with your schema. Primitive must be placed in container.`);
    }

    var payload = this._composition.get(pathToContainer);

    return new Promise((resolve, reject) => {
      this._startDriverRequest({
        method: 'set',
        fullPath: pathToContainer,
        payload: payload,
      }).then((resp) => {
        if (isPrimitive) {
          // update composition with server response
          let preparedResp = {
            ...resp,
            coocked: resp.coocked[paramPath],
          };
          this._composition.update(pathToPrimitive, preparedResp.coocked);
          resolve(preparedResp);
        }
        else {
          let pathTo = resp.request.pathToDocument || resp.request.fullPath;
          // update composition with server response
          this._composition.update(pathTo, resp.coocked);
          resolve(resp);
        }
      }, reject);
    });
  }

  saveContainer(pathToContainer) {
    // TODO: rise an event - saved
    var isPrimitive = false;
    var paramPath;

    var payload = this._composition.get(pathToContainer);

    return new Promise((resolve, reject) => {
      this._startDriverRequest({
        method: 'set',
        fullPath: pathToContainer,
        payload: payload,
      }).then((resp) => {
        if (isPrimitive) {
          // update composition with server response
          let preparedResp = {
            ...resp,
            coocked: resp.coocked[paramPath],
          };
          this._composition.update(pathToContainer, preparedResp.coocked);
          resolve(preparedResp);
        }
        else {
          let pathTo = resp.request.pathToDocument || resp.request.fullPath;
          // update composition with server response
          this._composition.update(pathTo, resp.coocked);
          resolve(resp);
        }
      }, reject);
    });
  }

  saveCollection(pathToCollection) {

    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(pathToCollection);

    var primaryKeyName = findPrimary(schema.item);

    return new Promise((mainResolve) => {
      var promises = [
        ...this._saveUnsaved(this._addedUnsavedItems, pathToCollection, {method: 'add', primaryKeyName}, (unsavedItem, resp) => {
          _.extend(unsavedItem, resp.coocked);
        }),
        ...this._saveUnsaved(this._removedUnsavedItems, pathToCollection, {method: 'remove', primaryKeyName}),
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
