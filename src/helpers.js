import _ from 'lodash';

export function recursiveSchema(root, schema, cb) {
  _.each(schema, function (childSchema, childName) {
    var childPath = _.trim(`${root}.${childName}`, '.');

    var isGoDeeper = cb(childPath, childSchema, childName);
    if (isGoDeeper) recursiveSchema(childPath, childSchema, cb);
  });
}




// TODO: уже не нужно

/**
 * Recursively run cb.
 * If cb returns true - go deeper
 * Else don't go deeper
 * @param root
 * @param schema
 * @param cb
 */
export function eachRecursive(root, schema, cb) {
  _.each(schema, function (value, name) {
    var newRoot = `${root}.${name}`;

    var isGoDeeper = cb(newRoot, value, name);
    if (_.isString(isGoDeeper)) {
      var newerRoot = `${newRoot}.${isGoDeeper}`;
      eachRecursive(newerRoot, value[isGoDeeper], cb);
    }
    else if (isGoDeeper) eachRecursive(newRoot, value, cb);
  });
}

/**
 * Recursively run callback on each element
 * omit handlers and params config e.g. "{type, default}" etc.
 * @param {string} root
 * @param {object} schema
 * @param {function} cb
 */
export function eachOwnParam (root, schema, cb) {
  eachRecursive(root, schema, function (path, value, name) {
    // call a callback
    cb(path, value);
    // if it's a param config or handler - don't go deeper
    return !(value.type || value.handler);
  });
}


/**
 * Recursively run callback on each handler
 * @param {string} root
 * @param {object} schema
 * @param {function} cb
 */
export function eachHandler (root, schema, cb) {
  eachRecursive(root, schema, function (path, value, name) {
    if (value.handler) {
      // call a callback
      cb(path, value);
      // go to schema
      return 'schema';
    }
    else {
      // if it isn't a param, go deeper
      return !value.type;
    }
  });
}
