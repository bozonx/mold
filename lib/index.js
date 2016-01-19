var composition = require('composition.js');

module.exports = {
  schema: require('schema.js'),
  composition: function (path) {
    return composition.getValue(path);
  },
  set: function (path, value) {
    composition.setValue(path, value);
  },
  // TODO: add get() - return object-wrapper
  // TODO: Is need to add immutable???
};
