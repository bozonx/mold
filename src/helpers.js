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

export function findPrimary(schema) {
  let primary;
  let schemaToFind;

  if (schema.schema) {
    schemaToFind = schema.schema;
  }
  else if (schema.item && schema.item.schema) {
    schemaToFind = schema.item.schema;
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

export function convertFromLodashToSchema(path) {
  let newPath = path;
  // replace collection params [1]
  newPath = newPath.replace(/\[\d+]/g, '!item!');

  // replace "." to ".schema."
  newPath = newPath.replace(/\./g, '.schema.');

  newPath =  newPath.replace(/!item!/g, '.item');

  return newPath;
}

export function convertFromSchemaToLodash(path) {
  return path.replace(/\.schema/g, '');
}

export function convertFromLodashToUrl(path) {
  const preUrl = path.replace(/\[(\d+)]/g, '.$1');
  return preUrl.replace(/\./g, '/');
}

export function convertFromMoldToDocumentStoragePath(moldPath) {
  return moldPath.replace(/(\[\d+])$/, '.documents$1');
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

export function getSchemaBaseType(schemaType) {
  if (schemaType == 'container') {
    return 'container';
  }
  if (schemaType == 'document') {
    return 'container';
  }
  else if (schemaType == 'pagedCollection') {
    return 'collection';
  }
  else if (schemaType == 'collection') {
    return 'collection';
  }
  else if (schemaType == 'documentsCollection') {
    return 'collection';
  }
  // TODO: primitive doesn't support
  else if (_.includes(['boolean', 'string', 'number', 'array'], schemaType)) {
    return 'primitive';
  }
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

export function getFirstChildPath(path) {
  if (_.isNumber(path)) return `[${path}]`;
  if (!path || !_.isString(path)) return '';

  const pathSplit = path.split('.');
  return pathSplit[0];
}

export function splitPath(moldPath) {
  // ff[1][3] = > ff.[1].[2] => ['ff', '[1]', [2]]
  let pathParts = moldPath.replace(/\[/g, '.[');
  return pathParts.split('.');
}



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
