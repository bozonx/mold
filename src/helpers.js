import _ from 'lodash';

export function recursively(root, item, cb) {
  if (!_.isPlainObject(item) && !_.isArray(item)) {
    cb(root);
    return;
  }

  _.each(item, function (value, name) {
    console.log(999999, root, name)
    // TODO: !!!!! ошибка с путем
    var childPath = _.trim(`${root}.${name}`, '.');

    var isGoDeeper = cb(childPath, value, name);
    if (_.isString(isGoDeeper)) {
      recursively(childPath, value[isGoDeeper], cb);
    }
    else if (isGoDeeper) recursively(childPath, value, cb);
  });
}

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



/**
 * Mutate object or array.
 * @param {object|array} sourceData - This will be mutate
 * @param {object|array} newData - This is new data
 * @param {function} cb - Callback(path, newValue, oldValue, action). It rises on each mutation or deletion
 * @param {string} root - It's path like "path.to[0].any[1].child".
 *                        It uses lodash path format form functions _.get(), _.set() etc.
 */
export function recursiveMutate(sourceData, newData, cb, root) {
  if (!root) root = '';

  function makePath(root, child) {
    // TODO: поддержка массивов
    return _.trim(`${root}.${child}`, '.');
  }

  function removeUnused(sourceData, newData, cb) {
    _.each(sourceData, function (value, name) {
      if (!newData[name]) {
        delete sourceData[name];
        if (cb) cb(makePath(root, name), undefined, sourceData[name], 'delete');
      }
    });
  }

  function updateArray(sourceData, newData, cb) {
    _.each(newData, function (value, index) {
      if (!sourceData[index]) {
        // It's like push but rise event
        sourceData.splice(sourceData.length + 1, 1, {})
      }
      recursiveMutate(sourceData[index], value, cb, makePath(root, index));
    });
  }

  if (_.isPlainObject(newData)) {
    // Sort new data
    let primitivesChildren = {};
    let objectOrArrayChildren = {};
    _.each(newData, function (value, name) {
      if (_.isPlainObject(value)) {
        objectOrArrayChildren[name] = value;
        if (!sourceData[name]) sourceData[name] = {};
      }
      else if (_.isArray(value)) {
        objectOrArrayChildren[name] = value;
        if (!sourceData[name]) sourceData[name] = [];
      }
      else {
        primitivesChildren[name] = value;
      }
    });

    // TODO: упростить - собрать во время сортировки
    var oldSourceData = _.cloneDeep(sourceData);

    // remove useless items
    removeUnused(sourceData, newData, cb);

    // extend only primitives
    _.extend(sourceData, primitivesChildren);

    // run callback on container
    if (cb) cb(root, newData, oldSourceData, 'update');

    // run callback on all leafs
    _.each(primitivesChildren, function (value, name) {
      if (cb) cb(makePath(root, name), value, oldSourceData[name], 'update');
    });


    // run recursively objects or arrays
    _.each(objectOrArrayChildren, function (value, name) {
      recursiveMutate(sourceData[name], value, cb, makePath(root, name));
    });
  }
  else if (_.isArray(newData)) {
    // TODO: callbacks!!!
    if (newData.length === 0) {
      // remove all
      _.remove(sourceData)
      // TODO: callbacks!!!
    }
    else if (_.isPlainObject(_.head(newData))) {
      // it's is collection
      // TODO: наверное по primary, так как индекс может не совпадать
      // remove useless items
      removeUnused(sourceData, newData, cb);
      updateArray(sourceData, newData, cb);
    }
    else if (_.isArray(_.head(newData))) {
      // is't simple array
      // remove useless items
      removeUnused(sourceData, newData, cb);
      updateArray(sourceData, newData, cb);
    }
    else {
      // primitives, null or undefined
      // remove useless items
      removeUnused(sourceData, newData, cb);
      _.each(newData, function (value, index) {
        sourceData[index] = value;
      });
      // TODO: callbacks!!!
    }
  }

  // If it isn't an object or array - do nothing
}

export function findPrimary(schema) {
  var primary = '';
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

export function convertToCompositionPath(moldPath) {
  var compositionPath = _.trim(moldPath.replace(/\{([a-zA-Z\_\$]+)}/g, '.\$1'), '.');
  compositionPath = compositionPath.replace(/\.(\d+)/g, '[\$1]');
  return compositionPath;
}

export function splitLastParamPath(path) {
  var splits = path.split('.');
  if (splits.length === 0) return {
    basePath: path,
    paramPath: undefined,
  };

  var paramPath = splits.pop();

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

// export function splitPath(path) {
//   // TODO: not need
//   // It gets path like this: "one.two[1].three[2].four"
//   // and makes something like this: "one.two.1.three.2.four"
//   var replaced = path.replace(/\{(\d+)}/g, ".\$1");
//   replaced = _.trim(replaced, '.');
//
//   return replaced.split('.');
// }

// export function parseCollectionPath(path) {
//   // TODO: not need
//   var parsed = path.match(/(.*)\{(\d+)}([^{]*)$/);
//   return {
//     collectionPath: parsed[1],
//     itemPrimary: parseInt(parsed[2]),
//     collectionItemPath: _.trim(parsed[3], '.'),
//   };
// }

