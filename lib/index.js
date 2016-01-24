var _ = require('lodash');
var composition = require('composition.js');
var log = require('log.js');
var nodeWrapper = require('nodeWrapper.js');
var boolean = require('schema/typeBoolean.js');
var number = require('schema/typeNumber.js');
var string = require('schema/typeString.js');
var struct = require('schema/typeStruct.js');
var schema = require('schema/schema.js');


// TODO: these:
//   * May be use immutable instead _.cloneDeep?
//   * in schema.getSchema сделать чтобы порядок добавления схем был не важен
//     * сначала можно создать схему по более глубокому пути, потом выше
//     * если верхняя схема имеет потомков, то смержить их с существующими потомками (родительские потомки в приоритете)

module.exports = {
  getSchema: _.bind(schema.getSchema, schema),
  schema: _.bind(schema.setSchema, schema),
  composition: _.bind(composition.getValue, composition),
  get: nodeWrapper.getInstance,
  set: _.bind(composition.setValue, composition),
  boolean: _.bind(boolean.schema, boolean),
  number: _.bind(number.schema, number),
  string: _.bind(string.schema, string),
  struct: _.bind(struct.schema, struct),

  $log: log,

  // Reset schema and composition. Only for tests
  $$reset: function () {
    schema.$$reset();
    composition.$$reset();
  }
};
