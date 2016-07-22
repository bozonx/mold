// It's runtime state manager
import _ from 'lodash';

import { recursiveSchema, findPrimary, splitLastParamPath } from './helpers';

export default class State {
  init(main, composition) {
    this._main = main;
    this._composition = composition;
    this._addedUnsavedItems = {};
    this._removedUnsavedItems = {};

    this._initComposition();
  }

  /**
   * Get value directly
   * @param path
   */
  getComposition(path) {
    // TODO: Does it really need?
    return this._composition.get(path);
  }

  /**
   * Set directly
   * @param path
   * @param value
   */
  // setComposition(path, value) {
  //   // TODO: Does it really need?
  //   this._composition.set(path, value);
  // }

  /**
   * Set primitive, container or collection to mold
   * @param {string} fullPath
   * @param {*} value - valid value
   */
  setMold(fullPath, value) {
    this._checkNode(fullPath, value);
    this._composition.update(fullPath, value);
  }

  addMold(pathToCollection, newItem) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(pathToCollection);
    if (schema.type !== 'collection')
      throw new Error(`Only collection type has "add" method.`);

    var preparedItem = {
      ...newItem,
      $isNew: true,
    };

    this._checkNode(pathToCollection, preparedItem);
    this._composition.addToBeginning(pathToCollection, preparedItem);
    this._addToUnsavedList(this._addedUnsavedItems, pathToCollection, preparedItem);
  }

  removeMold(pathToCollection, itemToRemove) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(pathToCollection);

    if (schema.type !== 'collection')
      throw new Error(`Only collection type has "add" method.`);
    if (!_.isNumber(itemToRemove.$index))
      throw new Error(`Deleted item must has an $index param.`);

    var realItem = _.find(this.getComposition(pathToCollection), itemToRemove);
    // do nothing if item isn't exist
    if (!realItem) return;

    this._composition.remove(pathToCollection, realItem.$index);
    this._addToUnsavedList(this._removedUnsavedItems, pathToCollection, realItem);
  }

  /**
   * Get data from driver, update mold with new data and return primise
   * @param fullPath
   * @returns {Promise}
   */
  load(fullPath) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(fullPath);

    if (schema.type == 'collection') {
      // get collection
      return new Promise((resolve, reject) => {
        this._startDriverQuery({ method: 'filter', fullPath: fullPath }).then((resp) => {
          // TODO: пересмотреть пути
          var pathTo = resp.request.pathToDocument || resp.request.fullPath;
          this._composition.update(pathTo, resp.coocked);
          resolve(resp);
        }, reject);
      });
    }
    else if (_.includes(['boolean', 'string', 'number', 'array'], schema.type)) {
      // get primitive
      return new Promise((resolve, reject) => {
        var splits = splitLastParamPath(fullPath);
        var basePath = splits.basePath;
        var paramPath = splits.paramPath;

        this._startDriverQuery({ method: 'get', fullPath: basePath }).then((resp) => {
          // TODO: пересмотреть пути

          // unwrap primitive value from container
          var preparedResponse = {
            ...resp,
            coocked: _.get(resp.coocked, paramPath)
          };

          this._composition.update(fullPath, preparedResponse.coocked);
          resolve(preparedResponse);
        }, reject);
      });
    }
    else if (!schema.type) {
      // get container
      return new Promise((resolve, reject) => {
        this._startDriverQuery({ method: 'get', fullPath: fullPath, }).then((resp) => {
          // TODO: пересмотреть пути
          //var pathTo = resp.request.pathToDocument || resp.request.fullPath;
          // TODO: формировать путь pathToDocument + путь внутненнего параметра
          var pathTo = resp.request.fullPath;
          this._composition.update(pathTo, resp.coocked);
          resolve(resp);
        }, reject);
      });
    }

    throw new Error(`Unknown type!`);
  }

  saveContainerOrPrimitive(pathToContainerOrPrimitive) {
    // TODO: refactor
    // TODO: rise an event - saved
    var isPrimitive = false;
    var paramPath;

    var pathToContainer;

    if (this._main.schemaManager.get(pathToContainerOrPrimitive).type) {
      isPrimitive = true;
      // If it is a primitive, get container upper on path
      let split = splitLastParamPath(pathToContainerOrPrimitive);
      paramPath = split.paramPath;

      if (_.isUndefined(split.paramPath))
      // TODO: это должно проверяться ещё на стадии валидации схемы.
        throw new Error(`Something wrong with your schema. Root of primitive must be a container.`);

      pathToContainer = split.basePath;
      if (this._main.schemaManager.get(pathToContainer).type) {
        // TODO: это должно проверяться ещё на стадии валидации схемы.
        throw new Error(`Something wrong with your schema. Primitive must be placed in container.`);
      }
    }
    else {
      // It is a container
      pathToContainer = pathToContainerOrPrimitive;
    }

    var payload = this.getComposition(pathToContainer);

    return new Promise((resolve, reject) => {
      this._startDriverQuery({
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
          this._composition.update(pathToContainerOrPrimitive, preparedResp.coocked);
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
    // TODO: rise an event - saved

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
        this._startDriverQuery({
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

  _addToUnsavedList(listWithUnsavedItems, pathToCollection, item) {
    if (!listWithUnsavedItems[pathToCollection])
      listWithUnsavedItems[pathToCollection] = [];

    listWithUnsavedItems[pathToCollection].push(item);
  }

  /**
   * Check for node. It isn't work with container.
   * It rises an error on invalid value or node.
   * @param {string} path - path to a param. (Not to container)
   * @param {*} value - value to set. (Not undefined and not an object)
   * @returns {boolean}
   * @private
   */
  _checkNode(path, value, schema) {
    schema = schema || this._main.schemaManager.get(path);

    // TODO: переделать!!!

    var _checkRecursively = function(path, value, childPath, childSchema) {
      if (childSchema.type) {
        // param
        var valuePath = childPath;
        if (path !== '') valuePath = childPath.replace(path + '.', '');

        var childValue = _.get(value, valuePath);

        // If value doesn't exist for this schema branch - do nothing
        if (_.isUndefined(childValue)) return false;

        // It rises an error on invalid value
        this._checkNode(childPath, childValue, childSchema);

        return false;
      }

      // If it's a container - go deeper
      return true;
    };

    if (schema.type == 'array') {
      // For array
      // TODO: validate all items in list
      return true;
    }
    else if (schema.type == 'collection') {
      // For collection
      // TODO: do it for parametrized lists
      // TODO: validate all items in list
      return true;
    }
    else if (schema.type) {
      // For primitive
      // TODO: validate it!!!
      return true;
    }
    else if (!schema.type) {
      // It's a container - check values for all children
      //recursiveSchema(path, schema, _checkRecursively.bind(this, path, value));
      return true;
    }


    throw new Error(`Not valid value "${JSON.stringify(value)}" of param "${path}"! See validation rules in your schema.`);
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
  _startDriverQuery(rawRequest) {
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

  /**
   * Set initial values (null|[]) to composition for all items from schema.
   * @private
   */
  _initComposition() {
    var compositionValues = {};

    recursiveSchema('', this._main.schemaManager.get(''), (newPath, value) => {
      if (value.type == 'array') {
        // array
        _.set(compositionValues, newPath, []);

        // Go deeper
        return false;
      }
      else if (value.type == 'collection') {
        _.set(compositionValues, newPath, []);

        // Go deeper
        return false;
      }
      else if (_.includes(['boolean', 'string', 'number'], value.type)) {
        // primitive
        _.set(compositionValues, newPath, null);

        return false;
      }
      else {
        // container
        _.set(compositionValues, newPath, {});

        // Go deeper
        return true;
      }
    });

    this._composition.$initAll(compositionValues);
  }
}
