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
  return path.replace(/\[\d+]/, '.item');
}
