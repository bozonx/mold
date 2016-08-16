import _ from 'lodash';

import { findPrimary, splitLastParamPath, getSchemaBaseType } from './helpers';

export default class Request {
  constructor(main, composition) {
    this._main = main;
    this._composition = composition;

    this._addedUnsavedItems = {};
    this._removedUnsavedItems = {};
  }

  /**
   * Add item to collection of unsaved added items .
   * @param {string} pathToCollection
   * @param {object} item
   */
  addUnsavedAddedItem(pathToCollection, item) {
    if (!this._addedUnsavedItems[pathToCollection])
      this._addedUnsavedItems[pathToCollection] = [];

    this._addedUnsavedItems[pathToCollection].push(item);
  }

  /**
   * Add item to collection unsaved removed items.
   * @param {string} pathToCollection
   * @param {object} item
   */
  addUnsavedRemovedItem(pathToCollection, item) {
    if (!this._removedUnsavedItems[pathToCollection])
      this._removedUnsavedItems[pathToCollection] = [];

    this._removedUnsavedItems[pathToCollection].push(item);
  }

  /**
   * Load primitive from driver
   * @param {string} pathToPrimitive
   * @returns {Promise}
   */
  loadPrimitive(pathToPrimitive) {
    return new Promise((resolve, reject) => {
      var splits = splitLastParamPath(pathToPrimitive);
      var basePath = splits.basePath;
      var paramPath = splits.paramPath;

      this._startDriverRequest('get', basePath).then((resp) => {
        // unwrap primitive value from container
        var preparedResponse = {
          ...resp,
          coocked: _.get(resp.coocked, paramPath)
        };

        console.log('---> finish load primitive: ', preparedResponse);

        // update mold with server response data
        this._composition.update(pathToPrimitive, preparedResponse.coocked);

        resolve(preparedResponse);
      }, reject);
    });
  }

  /**
   * Load container and it's contents from driver.
   * @param {string} pathToContainer
   * @param {string|number} sourcePathParam - dynamic part of source path
   * @returns {Promise}
   */
  loadContainer(pathToContainer, sourcePathParam) {
    return new Promise((resolve, reject) => {
      this._startDriverRequest('get', pathToContainer, undefined, sourcePathParam).then((resp) => {
        // update mold with server response data

        console.log('---> finish load container: ', resp);

        // TODO: так не должно быть
        var pathTo = (resp.request.document && resp.request.document.path) || resp.request.moldPath;

        this._composition.update(pathTo, resp.coocked);
        resolve(resp);
      }, reject);
    });
  }

  /**
   * Load collection from driver.
   * @param {string} pathToCollection
   * @returns {Promise}
   */
  loadCollection(pathToCollection) {
    return new Promise((resolve, reject) => {
      this._startDriverRequest('filter', pathToCollection).then((resp) => {
        // update mold with server response data

        console.log('---> finish load collection: ', resp);

        // TODO: так не должно быть
        var pathTo = (resp.request.document && resp.request.document.path) || resp.request.moldPath;

        this._composition.update(pathTo, resp.coocked);
        resolve(resp);
      }, reject);
    });
  }

  /**
   * Save primitive on path to driver.
   * @param {string} pathToPrimitive
   * @returns {Promise}
   */
  savePrimitive(pathToPrimitive) {
    // For primitive, get container upper on path
    var splits = splitLastParamPath(pathToPrimitive);
    var pathToContainer = splits.basePath;
    var subPath = splits.paramPath;

    if (_.isUndefined(splits.paramPath))
      // TODO: это должно проверяться ещё на стадии валидации схемы.
      throw new Error(`Something wrong with your schema. Root of primitive must be a container.`);

    if (this._main.schemaManager.get(pathToContainer).type)
      // TODO: это должно проверяться ещё на стадии валидации схемы.
      throw new Error(`Something wrong with your schema. Primitive must be placed in container.`);

    var payload = this._composition.get(pathToContainer);

    return new Promise((resolve, reject) => {
      this._startDriverRequest('set', pathToContainer, payload).then((resp) => {
        // update composition with server response
        let preparedResp = {
          ...resp,
          coocked: resp.coocked[subPath],
        };

        console.log('---> finish save primitive: ', preparedResp);

        // update mold with server response data
        this._composition.update(pathToPrimitive, preparedResp.coocked);
        resolve(preparedResp);
      }, reject);
    });
  }

  /**
   * Save container and it's contents to driver.
   * @param {string} pathToContainer
   * @param {string|number} sourcePathParam - dynamic part of source path
   * @returns {Promise}
   */
  saveContainer(pathToContainer, sourcePathParam) {
    var payload = this._composition.get(pathToContainer);

    return new Promise((resolve, reject) => {
      this._startDriverRequest('set', pathToContainer, payload, sourcePathParam).then((resp) => {
        console.log('---> finish save container: ', resp);

        // update mold with server response data
        this._composition.update(pathToContainer, resp.coocked);
        resolve(resp);
      }, reject);
    });
  }

  /**
   * Save unsaved removed or added items to driver.
   * @param {string} pathToCollection
   * @returns {Promise}
   */
  saveCollection(pathToCollection) {
    // Save all unsaved added or removed items
    return new Promise((mainResolve) => {
      var promises = [
        ...this._saveUnsaved(this._addedUnsavedItems, pathToCollection, 'add', (unsavedItem, resp) => {
          // update item from mold with server response data
          _.extend(unsavedItem, resp.coocked);
        }),
        ...this._saveUnsaved(this._removedUnsavedItems, pathToCollection, 'remove'),
      ];

      Promise.all(promises).then(results => {
        console.log('---> finish save collection: ', results);
        mainResolve(results);
      });
    });
  }

  _saveUnsaved(unsavedList, pathToCollection, method, successCb) {
    var promises = [];
    _.each(_.reverse(unsavedList[pathToCollection]), (unsavedItem) => {
      // skip empty
      if (_.isUndefined(unsavedItem)) return;

      // remove item from unsaved list
      _.remove(unsavedList[pathToCollection], unsavedItem);
      if (_.isEmpty(unsavedList[pathToCollection])) delete unsavedList[pathToCollection];

      promises.push(new Promise((resolve) => {
        this._startDriverRequest(method, pathToCollection, unsavedItem).then((resp) => {
          if (successCb) successCb(unsavedItem, resp);

          delete unsavedItem.$isNew;

          resolve({
            path: pathToCollection,
            isOk: true,
            resp,
          });
        }, (driverError) => {
          // on error make item unsaved again
          if (_.isUndefined(unsavedList[pathToCollection])) unsavedList[pathToCollection] = [];
          unsavedList[pathToCollection].push(unsavedItem);

          resolve({
            path: pathToCollection,
            isOk: false,
            driverError,
          });
        });
      }));
    });

    return promises;
  }

  /**
   * Send query to driver for data.
   * @param {string} method - one of: get, set, filter, add, remove
   * @param {string} moldPath - path in mold or schena
   * @param {*} [payload] - data to save
   * @param {string|number} sourcePathParam - dynamic part of source path
   * @returns {Promise}
   * @private
   */
  _startDriverRequest(method, moldPath, payload, sourcePathParam) {
    var driver = this._main.schemaManager.getDriver(moldPath);

    console.log(343453454, method, moldPath, payload, sourcePathParam)

    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(moldPath);

    var clearPayload = (_.isPlainObject(payload)) ? _.omit(_.cloneDeep(payload), '$index', '$isNew', '$unsaved') : payload;

    if (!driver)
      throw new Error(`No-one driver did found!!!`);

    var documentParams = this._main.schemaManager.getDocument(moldPath);
    var splits;
    if (documentParams && documentParams.pathToDocument && documentParams.pathToDocument != moldPath)
      splits = splitLastParamPath(documentParams.pathToDocument);

    var req = _.pickBy({
      method,
      moldPath,
      payload: !_.isEmpty(clearPayload) && clearPayload,
      primaryKeyName: schema.item && findPrimary(schema.item),
      schemaBaseType: getSchemaBaseType(schema.type),
      document: documentParams,
      driverPath: _.pickBy({
        // path to document
        document: documentParams && this.convertToSource(documentParams.pathToDocument, documentParams.source, sourcePathParam),
        full: (documentParams) ? this.convertToSource(moldPath, documentParams.source, sourcePathParam) : moldPath,
        // TODO: не правильно работает если брать элемент коллекции
        // base: splits && splits.basePath,
        // sub: splits && splits.paramPath,
      }),
    });

    console.log('---> start request: ', req);

    return driver.startRequest(req);
  }

  convertToSource(pathInSchema, realSource, sourcePathParam) {
    // TODO: test it
    if (!realSource) return pathInSchema;

    let sourceSplit = splitLastParamPath(realSource);

    // TODO: сделать поддержку вложенных коллекций
    if (sourceSplit.paramPath == '$item') {
      let pathSplits = splitLastParamPath(pathInSchema);
      // TODO: что если нет sourcePathParam???
      return `${sourceSplit.basePath}.${sourcePathParam}`
    }
    else {
      return realSource;
    }
  }

}
