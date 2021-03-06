const _ = require('lodash');


module.exports = {
  /**
   * It call cb recursively from root of schema.
   * @param fullSchema
   * @param cb
   */
  eachSchema(fullSchema, cb) {
    function letItRecursive(curMoldPath, curSchemaPath, curSchema) {
      // Do nothing if its isn't a plain object
      if (!_.isPlainObject(curSchema)) return;

      const isGoDeeper = cb(curMoldPath, curSchemaPath, curSchema);

      if (isGoDeeper === false) return;

      if (curSchema.item) {
        _.each(curSchema.item, (subSchema, nodeName) => {
          const childMoldPath = `${curMoldPath}.${nodeName}`;
          const childSchemaPath = `${curSchemaPath}.item.${nodeName}`;

          letItRecursive(childMoldPath, childSchemaPath, subSchema);
        });
      }
      else if (curSchema.schema) {
        _.each(curSchema.schema, (subSchema, nodeName) => {
          const childMoldPath = `${curMoldPath}.${nodeName}`;
          const childSchemaPath = `${curSchemaPath}.schema.${nodeName}`;

          letItRecursive(childMoldPath, childSchemaPath, subSchema);
        });
      }
      else if (curSchema.items) {
        _.each(curSchema.items, (subSchema, nodeName) => {
          const childMoldPath = `${curMoldPath}.${nodeName}`;
          const childSchemaPath = `${curSchemaPath}.items.${nodeName}`;

          letItRecursive(childMoldPath, childSchemaPath, subSchema);
        });
      }
      // else is one of primitive
    }

    // expand the first level
    _.each(fullSchema, (curSchema, nodeName) => {
      letItRecursive(nodeName, nodeName, curSchema);
    });
  },

  /**
   * It call cb recursively from root of schema.
   * @param {object} fullSchema - schema like { type: 'myType', ... }
   * @param {function} cb - callback like (curMoldPath, curSchemaPath, curSchema) => {}
   */
  eachPrimitiveSchema(fullSchema, cb) {
    function letItRecursive(curMoldPath, curSchemaPath, curSchema) {
      // Do nothing if its isn't a plain object
      if (!_.isPlainObject(curSchema)) return;

      if (curSchema.type === 'assoc') {
        _.each(curSchema.items, (subSchema, paramName) => {
          const childMoldPath = _.trimStart(`${curMoldPath}.${paramName}`, '.');
          const childSchemaPath = _.trimStart(`${curSchemaPath}.items.${paramName}`, '.');

          const isGoDeeper = cb(childMoldPath, childSchemaPath, subSchema);

          if (isGoDeeper === false) return;

          letItRecursive(childMoldPath, childSchemaPath, subSchema);
        });
      }
      else if (curSchema.type === 'array') {
        const childMoldPath = _.trimStart(`${curMoldPath}[]`, '.');
        const childSchemaPath = _.trimStart(`${curSchemaPath}.item`, '.');

        const isGoDeeper = cb(childMoldPath, curSchemaPath, curSchema);

        if (isGoDeeper === false) return;

        letItRecursive(childMoldPath, childSchemaPath, curSchema.item);
      }
      // else is other primitive
    }

    letItRecursive('', '', fullSchema);
  },

  correctUpdatePayload(currentData, newData) {
    const newerState = _.defaultsDeep(_.cloneDeep(newData), currentData);
    // fix primitive array update. It must update all the items
    // TODO: нужно поддерживать массивы в глубине

    _.each(newData, (item, name) => {
      // TODO: compact будет тормозить - оптимизировать.
      if (_.isArray(item) && !_.isPlainObject( _.head(_.compact(item)) )) {
        newerState[name] = item;
      }
    });

    return newerState;
  },

  getPrimaryName(schema) {
    let primary;
    let schemaToFind;

    if (schema.schema) {
      schemaToFind = schema.schema;
    }
    else if (schema.item) {
      schemaToFind = schema.item;
    }
    else {
      return;
    }

    _.find(schemaToFind, (value, name) => {
      if (_.isPlainObject(value) && value.primary) {
        primary = name;

        return true;
      }
    });

    return primary;
  },

  omitUnsaveable(payload, documentSchema) {
    const unsaveableParamsNames = [];

    _.each(documentSchema.schema, (item, name) => {
      if (item.saveable === false) unsaveableParamsNames.push(name);
    });

    return _.omit(payload, unsaveableParamsNames);
  },

  convertFromLodashToSchema(path) {
    let newPath = path;
    // replace collection params [1] ["dfg-ddfg-c453"]

    newPath = newPath.replace(/\[[^\s.\[\]]+]/g, '!item!');

    // replace "." to ".schema."
    newPath = newPath.replace(/\./g, '.schema.');

    newPath = newPath.replace(/!item!/g, '.item');

    return newPath;
  },

  convertFromSchemaToLodash(path) {
    return path.replace(/\.schema/g, '');
  },

  convertFromLodashToUrl(path) {
    // TODO: use url encode
    let preUrl;
    // ["123-df"] [1]

    preUrl = path.replace(/\[["']?([^\s.\[\]'"]+)["']?]/g, '.$1');

    return preUrl.replace(/\./g, '/');
  },

  convertFromUrlToLodash(url) {
    let converted = '';
    const urlParts = url.split('/');

    _.each(urlParts, (part) => {
      // TODO: наверное сначала надо использовать url decode
      if (part.match(/[^a-zA-Z\d_]/)) {
        converted += `["${part}"]`;
      }
      else if (part.match(/^\d+$/)) {
        converted += `[${part}]`;
      }
      else {
        converted += `.${part}`;
      }
    });

    return _.trimStart(converted, '.');
  },

  getTheBestMatchPath(sourcePath, pathsList) {
    let matchList = _.map(pathsList, (path) => {
      if (sourcePath.indexOf(path) === 0) return path;
    });

    matchList = _.compact(matchList);

    if (matchList.length > 1) {
      // two or more drivers - get the longest
      return _.reduce(matchList, (result, value) => value > result ? value : result);
    }
    else if (matchList.length === 1) {
      // one path
      return matchList[0];
    }
    // Else return undefined
  },

  /**
   * It contacts two paths. It supports arrays in lodash format.
   * @param root
   * @param relativePath
   * @returns {string}
   */
  concatPath(root, relativePath) {
    if (_.isNumber(relativePath)) {
      return `${root}[${relativePath}]`;
    }

    if (_.startsWith(relativePath, '[')) {
      return `${root}${relativePath}`;
    }

    return _.trim(`${root}.${relativePath}`, '.');
  },

  findTheClosestParentPath(path, assoc) {
    // TODO: нужна ли поддержка lodash array format???

    if (_.isEmpty(assoc)) return;

    const parents = _.compact(_.map(assoc, (value, name) => {
      if (path.indexOf(name) === 0) return name;
    }));

    return _.reduce(parents, (sum, n) => {
      return n.length > sum.length ? n : sum;
    });
  },

  splitPath(moldPath) {
    // ff[1][3] = > ff.[1].[2] => ['ff', '[1]', [2]]
    const pathParts = moldPath.replace(/\[/g, '.[');


    return _.compact(pathParts.split('.'));
  },

  joinPath(pathArray) {
    const joined = pathArray.join('.');
    // ['ff', '[1]', [2]] => ff.[1].[2] => ff[1][3]

    return joined.replace(/\.\[/g, '[');
  },

  /**
   * Validate schema params.
   * @param {object} obj - raw schema
   * @param {function} cb - callback which checks params. It has return:
   * * error message
   * * or true if it ok
   * * or undefined if params is unknown
   * @return {string|undefined} - It returns error message of undefined if there wasn't an error.
   */
  validateParams(obj, cb) {
    const checkedNames = [];

    let error;

    _.find(obj, (value, name) => {
      const result = cb(value, name);

      if (_.isString(result)) {
        error = result;
        checkedNames.push(name);

        return true;
      }
      else if (result === true) checkedNames.push(name);
    });

    if (error) return error;

    const diff = _.difference(_.keys(obj), checkedNames);

    if (!_.isEmpty(diff)) return `Unknown params: ${JSON.stringify(diff)}`;
  },

};



// export function isSimpleArray(value) {
//   // TODO: isn't used
//   if (!_.isArray(value)) return false;
//
//   const compacted = _.compact(value);
//
//   if (compacted.length === 0) return true;
//
//   const head = _.head(compacted);
//
//   if (!_.isPlainObject(head)) return true;
//
//   return _.isUndefined(head.$$key);
// }
//
// export function isCollection(value) {
//   // TODO: дублирует isSimpleCollection
//   // TODO: isn't used
//   if (!_.isArray(value)) return false;
//
//   const compacted = _.compact(value);
//
//   if (compacted.length === 0) return false;
//
//   const head = _.head(compacted);
//
//   if (!_.isPlainObject(head)) return false;
//
//
//   // TODO: зачем эта проверка???
//   return _.isNumber(head.$$key) || _.isString(head.$$key);
// }
//
// export function isSimpleCollection(value) {
//   // TODO: isn't used
//   if (!_.isArray(value)) return false;
//
//   const compacted = _.compact(value);
//
//   if (compacted.length === 0) return false;
//
//   const head = _.head(compacted);
//
//   return _.isPlainObject(head);
// }


// export function getFirstChildPath(path) {
//   if (_.isNumber(path)) return `[${path}]`;
//   if (!path || !_.isString(path)) return '';
//
//   const pathSplit = path.split('.');
//   return pathSplit[0];
// }

// export function convertFromMoldToDocumentStoragePath(moldPath) {
//   return moldPath.replace(/(\[\d+])$/, '.documents$1');
// }

// export function getUniqPartOfPaths(paths) {
//   if(_.isArray(paths) && paths.length == 1) {
//     return paths[0];
//   }
//   else if (_.isArray(paths) && paths.length > 1) {
//     // It ins't need for more difficult logic
//     var intersection = _.intersection(paths[0], paths[1]);
//     return intersection.join('.');
//   }
//   else {
//     // if string or other
//     return paths;
//   }
// }

// export function splitLastParamPath(path) {
//   var splits = path.split('.');
//   if (splits.length === 0) return {
//     basePath: path,
//     paramPath: undefined,
//   };
//
//   var paramPath = splits.pop();
//   var toNum = _.toNumber(paramPath);
//   if (!_.isNaN(toNum)) paramPath = toNum;
//
//   return {
//     basePath: splits.join('.'),
//     paramPath,
//   };
// }
