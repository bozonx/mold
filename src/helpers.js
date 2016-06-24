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

/**
 * Mutate object or array.
 * @param {object|array} sourceData - This will be mutate
 * @param {object|array} newData - This is new data
 */
export function recursiveMutate(sourceData, newData) {
  if (_.isObject(newData)) {
    // Sort only arrays or objects
    let primitivesChildren = {};
    let objectOrArrayChildren = {};

    _.each(newData, function (value, name) {
      if (_.isObject(value)) {
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

    // remove useless items
    _.each(sourceData, function (value, name) {
      if (!newData[name]) {
        delete sourceData[name];
      }
    });

    // extend only primitives
    _.extend(sourceData, primitivesChildren);

    _.each(objectOrArrayChildren, function (value, name) {
      recursiveMutate(sourceData[name], value);
    });
  }
  else if (_.isArray(newData)) {
    // TODO: если потомки массива примитивы
    //       - обновляем все элементы по индексам и удаляем в соурсе тех которых нет в новых
    // TODO: если потомки массива - массивы или объекты
    //       - проходимся по ним и вызываем рекурсию, предварительно убрав тех, которых нет из соурса

    // TODO: What can we do with array?
    // let primitivesChildren = [];
    // let objectOrArrayChildren = [];
    // _.each(newData, function (value, index) {
    //   if (_.isObject(value) || _.isArray(value)) {
    //     objectOrArrayChildren[name] = value;
    //   }
    //   else {
    //     others[name] = value;
    //   }
    // });
  }

  // If it isn't an object or array - do nothing
}

export function findPrimary(schema) {
  var primary = '';
  _.find(schema, (value, name) => {
    if (_.isObject(value) && value.primary) {
      primary = name;
      return true;
    }
  });
  return primary;
}


export function convertToSchemaPath(path) {
  return path.replace(/(\[\d+])|(\{\d+})/, '.item');
}

export function convertToCompositionPath(moldPath) {
  var compositionPath = _.trim(moldPath.replace(/\{([a-zA-Z\_\$]+)}/g, '.\$1'), '.');
  compositionPath = compositionPath.replace(/\{(\d+)}/g, '[\$1]');
  return compositionPath;
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

