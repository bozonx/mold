var _ = require('lodash');
//import * as log from 'log.js';
var log = require('log.js');
// Get root instance
var node = require('nodeInstance.js');
node = node.getInstance();
var schema = require('schema/schema.js');
var composition = require('composition.js');

var boolean = require('schema/typeBoolean.js');
var number = require('schema/typeNumber.js');
var string = require('schema/typeString.js');
var struct = require('schema/typeStruct.js');

// TODO: these:
//   * in schema.getSchema сделать чтобы порядок добавления схем был не важен
//     * сначала можно создать схему по более глубокому пути, потом выше
//     * если верхняя схема имеет потомков, то смержить их с существующими потомками (родительские потомки в приоритете)

module.exports = {
  getSchema:    _.bind(node.getSchema, node),
  schema:       _.bind(node.schema, node),
  composition:  _.bind(node.composition, node),
  get:          _.bind(node.get, node),
  set:          _.bind(node.set, node),

  boolean:      _.bind(boolean.schema, boolean),
  number:       _.bind(number.schema, number),
  string:       _.bind(string.schema, string),
  struct:       _.bind(struct.schema, struct),

  $log: log,

  // Reset schema and composition. Only for tests
  $$reset: function () {
    schema.$$reset();
    composition.$$reset();
  }
};
