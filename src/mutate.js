import _ from 'lodash';

class Mutate {
  constructor(storage) {
    this.storage = storage;
  }

  mutate(root, newData) {
    // TODO: зачем '' ?
    root = root || '';

    if (_.isPlainObject(newData)) {
      this.updateContainer(root, newData);
    }
    else if (_.isArray(newData) && newData.length > 0 && _.isPlainObject(_.head(newData))) {
      this.updateCollection(root, newData);
    }
    else {
      // It's primitive
      this.updatePrimitive(root, newData);
    }
  }

  updateContainer(root, newData) {
    _.each(newData, (value, name) => {
      this.mutate(this._makePath(root, name), value);
    });
  }

  updateCollection(root, newData) {
    // remove whore source collection if new collection is empty
    if (newData.length === 0)
      return _.remove(_.get(this.storage, root));

    var oldCollection = _.get(this.storage, root);

    // remove useless items
    _.each(oldCollection, (value, name) => {
      if (_.isNil(value)) return;

      if (!newData[name]) {
        delete oldCollection[name];
      }
    });

    // updateArray
    _.each(newData, (value, index) => {
      if (_.isNil(value)) return;

      if (oldCollection[index]) {
        // update existent item
        this.updateContainer(this._makePath(root, index), value);
      }
      else {
        // add new item if it doesn't exist
        // It's rise event like push, but we can set item to its index
        // TODO: проверить можно ли устанавливать на любой индекс не по порядку
        oldCollection.splice(oldCollection.length + 1, 1, value)
      }
    });
  }

  updatePrimitive(root, newData) {
    _.set(this.storage, root, newData);
  }

  _makePath(root, child) {
    if (_.isNumber(child)) {
      // Path form collection item
      return `${root}[${child}]`;
    }
    // Path for containers and primitives
    return _.trim(`${root}.${child}`, '.');
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
  //mutate(storage, root, newData);
  var mutate = new Mutate(storage);
  mutate.mutate(root, newData);
}
