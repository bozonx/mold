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
  // TODO: not need
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

export function splitPath(path) {
  // TODO: not need
  // It gets path like this: "one.two[1].three[2].four"
  // and makes something like this: "one.two.1.three.2.four"
  var replaced = path.replace(/\{(\d+)}/g, ".\$1");
  replaced = _.trim(replaced, '.');

  return replaced.split('.');
}

export function parseCollectionPath(path) {
  // TODO: not need
  var parsed = path.match(/(.*)\{(\d+)}([^{]*)$/);
  return {
    collectionPath: parsed[1],
    itemPrimary: parseInt(parsed[2]),
    collectionItemPath: _.trim(parsed[3], '.'),
  };
}

export function convertToCompositionPath(moldPath) {
  var compositionPath = _.trim(moldPath.replace(/\{([a-zA-Z\_\$]+)}/g, '.\$1'), '.');
  compositionPath = compositionPath.replace(/\{(\d+)}/g, '[\$1]');
  return compositionPath;
}
