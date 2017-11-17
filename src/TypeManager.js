import _ from 'lodash';

import { splitPath, convertFromLodashToSchema } from './helpers';


export default class TypeManager {
  constructor(main) {
    this._main = main;
    this._registeredTypes = {};
  }

  isRegistered(typeName) {
    return !!this._registeredTypes[typeName];
  }

  register(typeName, typeClass) {
    this._registeredTypes[typeName] = typeClass;
  }

  /**
   * Get instance of type
   * @param {string} path - absolute path or relative if context is used
   * @param {object} context - instance of root element
   * @returns {object|undefined} - instance of type
   */
  getInstance(path, context=undefined) {
    if (!_.isString(path)) this._main.$$log.fatal(`You must pass a path argument.`);
    if (!path && !context) this._main.$$log.fatal(`Path is empty.`);
    if (!path && context) return context;

    let rootInstance;
    let childPathParts;

    if (context) {
      // use received context
      childPathParts = splitPath(path);
      rootInstance = context;
    }
    else {
      // use instance of first level of path
      const pathParts = splitPath(path);
      // get path parts after start from index of 1
      childPathParts = pathParts.slice(1);
      // get root instance
      rootInstance = this.$getInstanceByFullPath({
        // TODO: use moldPath, schemaPath, storagePath
        mold: pathParts[0],
        schema: convertFromLodashToSchema(pathParts[0]),
        storage: pathParts[0],
      });

      // if there is only first level of path - return its instance.
      if (childPathParts.length === 0) return rootInstance;
    }

    // TODO: throw an Error if instant hasn't found
    return this._findInstance(childPathParts, rootInstance);
  }

  /**
   * It just returns an instance
   * @param {{mold: string, schema: string, storage: string}} paths
   */
  $getInstanceByFullPath(paths) {
    // It rise an error if path doesn't consist with schema
    const schema = this._main.$$schemaManager.getSchema(paths.schema);
    const instance = this._newInstance(schema.type);
    instance.$init(paths, schema);

    return instance;
  }

  validateType(typeName, schema, schemaPath) {
    if (!this._registeredTypes[typeName]) return;

    if (this._registeredTypes[typeName].validateSchema) {
      const result = this._registeredTypes[typeName].validateSchema(schema, schemaPath);
      if (_.isString(result)) {
        this._main.$$log.fatal(result);
      }
    }
  }


  _findInstance(pathParts, rootInstance) {
    // TODO: вывалить ошибку при попытке получить тип по несуществующему пути

    let currentInstance = rootInstance;
    let result = undefined;
    _.each(pathParts, (currentPathPiece, index) => {
      if (index === pathParts.length - 1) {
        // the last part of path
        result = currentInstance.$getChildInstance(currentPathPiece);
      }
      else {
        // not last
        // all the parents have to implement of $getChildInstance method.
        if (!currentInstance.$getChildInstance)
          this._main.$$log.fatal(`There is no method "$getChildInstance" of ${currentInstance.root}`);

        currentInstance = currentInstance.$getChildInstance(currentPathPiece);
      }
    });

    return result;
  }

  _newInstance(typeName) {
    return new this._registeredTypes[typeName](this._main);
  }

}
