import _ from 'lodash';

import { splitPath, convertFromLodashToSchema } from './helpers';


export default class NodeManager {
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
   * @param {string} moldPath - absolute path
   * @returns {object|undefined} - instance of type
   */
  getInstance(moldPath) {
    if (!_.isString(moldPath)) this._main.$$log.fatal(`You must pass a path argument.`);

    const schemaPath = convertFromLodashToSchema(moldPath);
    const schema = this._main.$$schemaManager.getSchema(schemaPath);

    if (_.isUndefined(schema)) {
      this._main.$$log.fatal(`Schema on path "${schemaPath}" doesn't exists`);
    }

    // disallow to get container and driver instance
    if (schema.type === 'container' || schema.type === 'driver') {
      // it means a container
      this._main.$$log.fatal(`You can't get instance of simple container or driver nodes on path "${schemaPath}"`);
    }

    return this._newInstance(moldPath, schema);
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


  // _findInstance(pathParts, rootInstance) {
  //   // TODO: вывалить ошибку при попытке получить тип по несуществующему пути
  //
  //   let currentInstance = rootInstance;
  //   let result = undefined;
  //   _.each(pathParts, (currentPathPiece, index) => {
  //     if (index === pathParts.length - 1) {
  //       // the last part of path
  //       result = currentInstance.$getChildInstance(currentPathPiece);
  //     }
  //     else {
  //       // not last
  //       // all the parents have to implement of $getChildInstance method.
  //       if (!currentInstance.$getChildInstance)
  //         this._main.$$log.fatal(`There is no method "$getChildInstance" of ${currentInstance.root}`);
  //
  //       currentInstance = currentInstance.$getChildInstance(currentPathPiece);
  //     }
  //   });
  //
  //   return result;
  // }

  _newInstance(moldPath, schema) {
    const instance = new this._registeredTypes[schema.type](this._main);
    instance.$init(moldPath, schema);

    return instance;
  }

}
