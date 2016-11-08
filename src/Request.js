import _ from 'lodash';

import { findPrimary, getSchemaBaseType } from './helpers';

export default class Request {
  constructor(main, storage, saveBuffer) {
    this._main = main;
    this._storage = storage;
    this._saveBuffer = saveBuffer;
  }

  /**
   * Load container and it's contents from driver.
   * @param {string} pathToContainer
   * @param {object|null} sourceParams - dynamic part of source path
   * @returns {Promise}
   */
  loadDocument(pathToContainer, sourceParams) {
    // TODO: не делать ещё промис - использовать промис драйвера
    return new Promise((resolve, reject) => {
      this._startDriverRequest('get', pathToContainer, undefined, sourceParams).then((resp) => {
        // update mold with server response data

        this._main.$$log.info('---> finish load container: ', resp);

        this._storage.update(pathToContainer, resp.coocked);
        resolve(resp);
      }, reject);
    });
  }

  /**
   * Load collection from driver.
   * @param {string} pathToCollection
   * @param {object|null} sourceParams - dynamic part of source path
   * @returns {Promise}
   */
  loadCollection(pathToCollection, sourceParams) {
    return new Promise((resolve, reject) => {
      this._startDriverRequest('filter', pathToCollection, undefined, sourceParams).then((resp) => {
        // update mold with server response data

        this._main.$$log.info('---> finish load collection: ', resp);

        this._storage.update(pathToCollection, resp.coocked);
        resolve(resp);
      }, reject);
    });
  }

  /**
   * Save container and it's contents to driver.
   * @param {string} pathToContainer
   * @param {object|null} sourceParams - dynamic part of source path
   * @returns {Promise}
   */
  saveDocument(pathToContainer, sourceParams) {
    var payload = this._storage.get(pathToContainer);

    return new Promise((resolve, reject) => {
      this._startDriverRequest('set', pathToContainer, payload, sourceParams).then((resp) => {
        this._main.$$log.info('---> finish save container: ', resp);

        // update mold with server response data
        this._storage.update(pathToContainer, resp.coocked);
        resolve(resp);
      }, reject);
    });
  }

  /**
   * Save unsaved removed or added items to driver.
   * @param {string} pathToCollection
   * @param {object|null} sourceParams - dynamic part of source path
   * @returns {Promise}
   */
  saveCollection(pathToCollection, sourceParams) {
    // Save all unsaved added or removed items
    return new Promise((mainResolve) => {
      var promises = [
        ...this._saveUnsaved(this._saveBuffer.getAdded(), pathToCollection, 'add', sourceParams, (unsavedItem, resp) => {
          // update item from mold with server response data
          _.extend(unsavedItem, resp.coocked);
        }),
        ...this._saveUnsaved(this._saveBuffer.getRemoved(), pathToCollection, 'remove', sourceParams),
      ];

      Promise.all(promises).then(results => {
        this._main.$$log.info('---> finish save collection: ', results);
        mainResolve(results);
      });
    });
  }

  _saveUnsaved(unsavedList, pathToCollection, method, sourceParams, successCb) {
    // TODO: пересмотреть
    var promises = [];
    _.each(_.reverse(unsavedList[pathToCollection]), (unsavedItem) => {
      // skip empty
      if (_.isUndefined(unsavedItem)) return;

      // remove item from unsaved list
      _.remove(unsavedList[pathToCollection], unsavedItem);
      if (_.isEmpty(unsavedList[pathToCollection])) delete unsavedList[pathToCollection];

      promises.push(new Promise((resolve) => {
        this._startDriverRequest(method, pathToCollection, unsavedItem, sourceParams).then((resp) => {
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
   * @param {object} sourceParams - dynamic part of source path
   * @returns {Promise}
   * @private
   */
  _startDriverRequest(method, moldPath, payload, sourceParams) {
    // TODO: !!!! pathToDocument не надо - он всегда = moldPath
    // TODO: moldPath переименовать в storagePath

    var driver = this._main.$$schemaManager.getDriver(moldPath);
    if (!driver)
      throw new Error(`No-one driver did found!!!`);

    // It rise an error if path doesn't consist with schema
    var schema = this._main.$$schemaManager.get(moldPath);

    var clearPayload = (_.isPlainObject(payload)) ? _.omit(_.cloneDeep(payload), '$index', '$isNew', '$unsaved') : payload;

    // TODO: надо добавить ещё document params
    var documentParams = {
      source: schema.source,
      pathToDocument: moldPath,
    };

    // TODO: pickBy - убирает даже null и '' - что может быть не желательно
    // TODO: вынести в отдельный метод
    var req = _.pickBy({
      method,
      moldPath,
      payload: !_.isEmpty(clearPayload) && clearPayload,
      primaryKeyName: schema.item && findPrimary(schema.item),
      schemaBaseType: getSchemaBaseType(schema.type),
      document: documentParams,
      driverPath: _.pickBy({
        // path to document
        document: documentParams && this._convertToSource(documentParams.pathToDocument, documentParams.source, sourceParams),
        full: (documentParams) ? this._convertToSource(moldPath, documentParams.source, sourceParams) : moldPath,
        // TODO: не правильно работает если брать элемент коллекции
        // base: splits && splits.basePath,
        // sub: splits && splits.paramPath,
      }),
    });

    this._main.$$log.info('---> start request: ', req);

    return driver.startRequest(req);
  }

  _convertToSource(pathInSchema, realSource, sourceParams) {
    if (!realSource) return pathInSchema;

    return _.template(realSource)(sourceParams);
  }

}
