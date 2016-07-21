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
   * Get data by a path.
   * It sends request to applicable driver.
   * After it sets a value from response to composition and return promise with this value.
   * @param {string} pathToContainer - absolute path
   * @returns {Promise}
   */
  getContainer(pathToContainer) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(pathToContainer);

    if (schema.type)
      throw new Error(`Method "getContainer" supports only container type.`);

    return new Promise((resolve, reject) => {
      this._startDriverQuery({
        method: 'get',
        fullPath: pathToContainer,
      }).then((resp) => {
        //var pathTo = resp.request.pathToDocument || resp.request.fullPath;
        // TODO: формировать путь pathToDocument + путь внутненнего параметра
        var pathTo = resp.request.fullPath;
        this._composition.update(pathTo, resp.coocked);
        resolve(resp);
      }, reject);
    });
  }

  getCollection(pathToCollection) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(pathToCollection);

    if (schema.type != 'collection')
      throw new Error(`Method "getCollection" supports only collection type.`);

    return new Promise((resolve, reject) => {
      this._startDriverQuery({
        method: 'filter',
        fullPath: pathToCollection,
      }).then((resp) => {
        var pathTo = resp.request.pathToDocument || resp.request.fullPath;
        this._composition.update(pathTo, resp.coocked);
        resolve(resp);
      }, reject);
    });
  }

  setMold(pathToContainer, containerValue) {
    // TODO: тут не обязательно устанавливать в контейнер, можно прямо в primitive

    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(pathToContainer);

    if (_.includes(['boolean', 'string', 'number', 'array'], schema.type))
      throw new Error(`You can't do request for a primitive! Only containers are support.`);

    // Check all nodes
    this._checkNode(schema, pathToContainer, containerValue);

    this._composition.update(pathToContainer, containerValue);
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

    // Check all nodes
    this._checkNode(schema, pathToCollection, preparedItem);

    this._composition.add(pathToCollection, preparedItem);

    if (!this._addedUnsavedItems[pathToCollection])
      this._addedUnsavedItems[pathToCollection] = [];

    this._addedUnsavedItems[pathToCollection].push(preparedItem);
  }

  removeMold(pathToCollection, itemToRemove) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(pathToCollection);

    if (schema.type !== 'collection')
      throw new Error(`Only collection type has "add" method.`);
    if (!_.isNumber(itemToRemove.$index))
      throw new Error(`Deleted item must has an $index param.`);

    var realItem = _.find(this.getComposition(pathToCollection), itemToRemove);

    this._composition.remove(pathToCollection, itemToRemove.$index);

    if (!this._removedUnsavedItems[pathToCollection])
      this._removedUnsavedItems[pathToCollection] = [];

    this._removedUnsavedItems[pathToCollection].push(realItem);
  }

  saveContainerOrPrimitive(pathToContainerOrPrimitive) {
    // TODO: rise an event - saved

    var pathToContainer;

    if (this._main.schemaManager.get(pathToContainerOrPrimitive).type) {
      // If it isn't container, get container upper on path
      let split = splitLastParamPath(pathToContainerOrPrimitive);

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
      pathToContainer = pathToContainerOrPrimitive;
    }

    var payload = this.getComposition(pathToContainer);

    return new Promise((resolve, reject) => {
      this._startDriverQuery({
        method: 'set',
        fullPath: pathToContainer,
        payload: payload,
      }).then((resp) => {
        var pathTo = resp.request.pathToDocument || resp.request.fullPath;
        // update composition with server response
        this._composition.update(pathTo, resp.coocked);
        resolve(resp);
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
    _.each(unsavedList[pathToCollection], (unsavedItem) => {
      var payload = _.omit(_.cloneDeep(unsavedItem), '$index', '$isNew', '$unsaved');
      // TODO: проверить в реальных условиях - не должно быть $isNew
      //payload = _.omit(payload, '$isNew');

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

          unsavedItem.$isNew = undefined;

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
   * Check for node. It isn't work with container.
   * It rises an error on invalid value or node.
   * @param {object} schema - schema for path
   * @param {string} path - path to a param. (Not to container)
   * @param {*} value - value to set. (Not undefined and not an object)
   * @returns {boolean}
   * @private
   */
  _checkNode(schema, path, value) {
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
        this._checkNode(childSchema, childPath, childValue);

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
   * @param {{method: string, fullPath: string, payload: *}} params
   *     * method is one of: get, set, add, remove
   *     * fullPath: full path in mold
   *     * payload: for "set" and "add" methods - value to set
   * @returns {Promise}
   * @private
   */
  _startDriverQuery(params) {
    var driver = this._main.schemaManager.getDriver(params.fullPath);

    if (!driver)
      throw new Error(`No-one driver did found!!!`);

    var req = _.clone(params);
    var documentParams = this._main.schemaManager.getDocument(params.fullPath);
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
      else if (value.type == 'boolean' || value.type == 'string' || value.type == 'number') {
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
