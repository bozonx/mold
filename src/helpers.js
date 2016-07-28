import _ from 'lodash';

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

export function convertToSchemaPath(path) {
  return path.replace(/(\[\d+])|(\.\d+)/, '.item');
}

export function convertToLodashPath(moldPath) {
  return moldPath.replace(/\.(\d+)/g, '[\$1]');
}

export function convertFromLodashToMoldPath(moldPath) {
  return moldPath.replace(/\[(\d+)]/g, '.\$1');
}

export function splitLastParamPath(path) {
  var splits = path.split('.');
  if (splits.length === 0) return {
    basePath: path,
    paramPath: undefined,
  };

  var paramPath = splits.pop();
  var toNum = _.toNumber(paramPath);
  if (!_.isNaN(toNum)) paramPath = toNum;

  return {
    basePath: splits.join('.'),
    paramPath,
  };
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

export function concatPath(root, relativePath) {
  //   if (_.startsWith(relativePath, '['))
  //     return `${this._root}${relativePath}`;
  //
  return `${root}.${relativePath}`;
}

export function getSchemaBaseType(schemaType) {
  if (schemaType == 'collection') {
    return 'collection';
  }
  else if(!schemaType) {
    return 'container';
  }
  else {
    return 'primitive';
  }
}
