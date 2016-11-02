import _ from 'lodash';

export function recursiveSchema(root, schema, cb) {
  _.each(schema, function (childSchema, childName) {
    if (!_.isPlainObject(childSchema)) return;

    var childPath = _.trim(`${root}.${childName}`, '.');

    var isGoDeeper = cb(childPath, childSchema, childName);
    if (_.isString(isGoDeeper)) {
      recursiveSchema(childPath, childSchema[isGoDeeper], cb);
    }
    else if (isGoDeeper) recursiveSchema(childPath, childSchema, cb);
  });
}

export function findPrimary(schema) {
  var primary;
  _.find(schema, (value, name) => {
    if (_.isPlainObject(value) && value.primary) {
      primary = name;
      return true;
    }
  });
  return primary;
}

export function convertToSchemaPathFromLodash(path) {
  var newPath = path;
  // replace collection params [1]
  newPath =  newPath.replace(/\[\d+]/g, '!item!');

  // TODO: use symbol
  // replace "." to ".schema."
  newPath = newPath.replace(/\./g, '.schema.');

  newPath =  newPath.replace(/!item!/g, '.item');

  return newPath;
}

export function getTheBestMatchPath(sourcePath, pathsList) {
  var matchList = _.map(pathsList, (path) => {
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
  else if (_.includes(['boolean', 'string', 'number', 'array'], schemaType)) {
    return 'primitive';
  }
}

export function findTheClosestParentPath(path, assoc) {
  // TODO: нужна ли поддержка lodash array format???

  if (_.isEmpty(assoc)) return;

  var parents = _.compact(_.map(assoc, (value, name) => {
    if (path.indexOf(name) === 0) return name;
  }));

  return _.reduce(parents, (sum, n) => {
    return (n.length > sum.length) ? n : sum;
  });
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

// export function recursively(root, item, cb) {
//   if (!_.isPlainObject(item) && !_.isArray(item)) {
//     cb(root);
//     return;
//   }
//
//   _.each(item, function (value, name) {
//     console.log(999999, root, name)
//     // TODO: !!!!! ошибка с путем
//     var childPath = _.trim(`${root}.${name}`, '.');
//
//     var isGoDeeper = cb(childPath, value, name);
//     if (_.isString(isGoDeeper)) {
//       recursively(childPath, value[isGoDeeper], cb);
//     }
//     else if (isGoDeeper) recursively(childPath, value, cb);
//   });
// }
