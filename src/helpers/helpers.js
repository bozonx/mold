import _ from 'lodash';

/**
 * It call cb recursively from root of schema.
 * @param fullSchema
 * @param cb
 */
export function eachSchema(fullSchema, cb) {
  function letItRecursive(curPath, curSchema) {
    // Do nothing if its isn't a plain object
    if (!_.isPlainObject(curSchema)) return;

    const isGoDeeper = cb(curPath, curSchema);
    if (isGoDeeper === false) return;

    if (curSchema.item) {
      letItRecursive(`${curPath}.item`, curSchema['item']);
    }
    else if (curSchema.schema) {
      _.each(curSchema['schema'], function (subSchema, nodeName) {
        letItRecursive(`${curPath}.schema.${nodeName}`, subSchema);
      });
    }
    // else is one of primitive
  }

  // expand the first level
  _.each(fullSchema, function (curSchema, nodeName) {
    letItRecursive(nodeName, curSchema);
  });
}

export function correctUpdatePayload(currentData, newData) {
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
}

export function getPrimaryName(schema) {
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
}

export function omitUnsaveable(payload, documentSchema) {
  const unsaveableParamsNames = [];
  _.each(documentSchema.schema, (item, name) => {
    if (item.saveable === false) unsaveableParamsNames.push(name);
  });
  return _.omit(payload, unsaveableParamsNames);
}


export function convertFromLodashToSchema(path) {
  let newPath = path;
  // replace collection params [1] ["dfg-ddfg-c453"]
  newPath = newPath.replace(/\[[^\s.\[\]]+]/g, '!item!');

  // replace "." to ".schema."
  newPath = newPath.replace(/\./g, '.schema.');

  newPath =  newPath.replace(/!item!/g, '.item');

  return newPath;
}

export function convertFromSchemaToLodash(path) {
  return path.replace(/\.schema/g, '');
}

export function convertFromLodashToUrl(path) {
  // TODO: use url encode
  let preUrl;
  // ["123-df"] [1]
  preUrl = path.replace(/\[["']?([^\s.\[\]'"]+)["']?]/g, '.$1');

  return preUrl.replace(/\./g, '/');
}

export function convertFromUrlToLodash(url) {
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
}

export function getTheBestMatchPath(sourcePath, pathsList) {
  let matchList = _.map(pathsList, (path) => {
    if (sourcePath.indexOf(path) === 0) return path;
  });
  matchList = _.compact(matchList);

  if (matchList.length > 1) {
    // two or more drivers - get the longest
    return _.reduce(matchList, (result, value) => (value > result) ? value : result);
  }
  else if (matchList.length === 1) {
    // one path
    return matchList[0];
  }
  // Else return undefined
}

/**
 * It contacts two paths. It supports arrays in lodash format.
 * @param root
 * @param relativePath
 * @returns {string}
 */
export function concatPath(root, relativePath) {
  if (_.isNumber(relativePath))
    return `${root}[${relativePath}]`;

  if (_.startsWith(relativePath, '['))
    return `${root}${relativePath}`;

  return _.trim(`${root}.${relativePath}`, '.');
}

export function findTheClosestParentPath(path, assoc) {
  // TODO: нужна ли поддержка lodash array format???

  if (_.isEmpty(assoc)) return;

  const parents = _.compact(_.map(assoc, (value, name) => {
    if (path.indexOf(name) === 0) return name;
  }));

  return _.reduce(parents, (sum, n) => {
    return (n.length > sum.length) ? n : sum;
  });
}

export function splitPath(moldPath) {
  // ff[1][3] = > ff.[1].[2] => ['ff', '[1]', [2]]
  const pathParts = moldPath.replace(/\[/g, '.[');
  return _.compact(pathParts.split('.'));
}

export function joinPath(pathArray) {
  const joined = pathArray.join('.');
  // ['ff', '[1]', [2]] => ff.[1].[2] => ff[1][3]
  return joined.replace(/\.\[/g, '[');
}

export function isSimpleArray(value) {
  // TODO: test it
  if (!_.isArray(value)) return false;

  const compacted = _.compact(value);

  if (compacted.length === 0) return true;

  const head = _.head(compacted);

  if (!_.isPlainObject(head)) return true;

  return _.isUndefined(head.$$key);
}

export function isCollection(value) {
  // TODO: test it
  if (!_.isArray(value)) return false;

  const compacted = _.compact(value);

  if (compacted.length === 0) return false;

  const head = _.head(compacted);

  if (!_.isPlainObject(head)) return false;

  return _.isNumber(head.$$key) || _.isString(head.$$key);
}



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
