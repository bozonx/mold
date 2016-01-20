//var _ = require('lodash');

class Struct {
  constructor () {
  }

  struct (children) {
    var node = {};
    node.type = 'struct';
    // TODO: how to validate struct? - наверное значения должны быть одни из наших, не может быть пустого struct
    node.children = children;
    return node;
  }
}

var struct = new Struct();
module.exports = struct;
