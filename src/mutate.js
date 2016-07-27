import _ from 'lodash';

class Mutate {
  constructor(storage) {
    this.storage = storage;
  }

  
}


/**
 * Mutate object or array.
 * @param {object|array} storage - This will be mutate
 * @param {string} root - It's path like "path.to[0].any[1].child".
 *                        It uses lodash path format form functions _.get(), _.set() etc.
 * @param {object|array} newData - This is new data
 */
export default function(storage, root, newData) {
  mutate(storage, root, newData);
}

function mutate(storage, root, newData) {
  // TODO: зачем???
  if (!root) root = '';

  if (_.isPlainObject(newData)) {
    updateContainer(storage, root, newData);
  }
  else if (_.isArray(newData) && newData.length > 0 && _.isPlainObject(_.head(newData))) {
    updateCollection(storage, root, newData);
  }
  else {
    // It's primitive
    updatePrimitive(storage, root, newData);
  }
}


function makePath(root, child) {
  // TODO: поддержка массивов
  return _.trim(`${root}.${child}`, '.');
}

function removeUnused(storage, newData, cb) {
  _.each(storage, function (value, name) {
    if (!newData[name]) {
      delete storage[name];
      if (cb) cb(makePath(root, name), undefined, storage[name], 'delete');
    }
  });
}

function updateArray(storage, newData, cb) {
  _.each(newData, function (value, index) {
    if (!storage[index]) {
      // It's rise event like push, but we can set item to its index
      // TODO: проверить можно ли устанавливать на любой индекс не по порядку
      storage.splice(storage.length + 1, 1, {})
    }
    recursiveMutate(storage[index], value, cb, makePath(root, index));
  });
}




function updatePrimitive(storage, root, newData) {
  _.set(storage, root, newData);
}

function updateContainer(storage, root, newData) {
  _.each(newData, function (value, name) {
    if (_.isPlainObject(value)) {
      updateContainer(storage, makePath(root, name), value);
    }
    else if (_.isArray(newData) && newData.length > 0 && _.isPlainObject(_.head(newData))) {
      updateCollection(storage, makePath(root, name), value);
    }
    else {
      // Primitive
      updatePrimitive(storage, makePath(root, name), value)
    }
  });

  // remove useless items
  // TODO: продумать
  //removeUnused(storage, newData);
}

function updateCollection(storage, root, newData) {
  // remove whore source collection if new collection is empty
  if (newData.length === 0)
    return _.remove(_.get(storage, root));

  // TODO: наверное по primary, так как индекс может не совпадать

  // remove useless items
  _.each(storage, function (value, name) {
    if (!newData[name]) {
      delete storage[name];
      if (cb) cb(makePath(root, name), undefined, storage[name], 'delete');
    }
  });

  var oldCollection = _.get(storage, root);

  // updateArray
  _.each(newData, function (value, index) {
    if (oldCollection[index]) {
      // update existent item
      updateContainer(storage, value, cb, makePath(root, index));
    }
    else {
      // add new item if it doesn't exist
      // It's rise event like push, but we can set item to its index
      // TODO: проверить можно ли устанавливать на любой индекс не по порядку
      oldCollection.splice(oldCollection.length + 1, 1, value)
    }
  });
}
