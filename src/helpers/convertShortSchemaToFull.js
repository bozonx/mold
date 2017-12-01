import _ from 'lodash';


class Convert {
  constructor(shortSchema) {
    this.shortSchema = shortSchema;
    this._fullSchema = {};
  }

  convert() {
    if (this.shortSchema.type) {
      // node
      this._processingNode('', this.shortSchema);
    }
    else {
      // root
      _.each(this.shortSchema, (item, name) => {
        this._processingNode(name, item);
      });
    }

    return this._fullSchema;
  }

  _processingNode(fullPath, node) {
    if (_.isPlainObject(node)) {
      if (node.type) {
        this._parseNode(fullPath, node);
      }
      else {
        // short container
        this._parseShortContainer(fullPath, node);
      }
    }
    else {
      this._main.$$log.fatal(`ERROR: bad schema node on path "${fullPath}"`);
    }
  }

  _parseNode(fullPath, node) {
    // node
    // just set it to fullSchema
    this._insert(fullPath, node);

    // go deeper
    if (node.schema) {
      this._eachNodeSchema(fullPath, node);
    }
    // TODO: item - это assoc - простой объект
    // else if (node.item) {
    //   const deepFullPath = _.trim(`${fullPath}.item`, '.');
    //   recursive(deepFullPath, node.item);
    // }
  }

  _parseShortContainer(fullPath, schema) {
    // convert to full container
    const fullContainer = {
      type: 'container',
      schema,
    };

    this._insert(fullPath, fullContainer);
    this._eachNodeSchema(fullPath, fullContainer);
  }

  _eachNodeSchema(fullPath, node) {
    if (!_.isPlainObject(node.schema)) {
      this._main.$$log.fatal(`ERROR: bad schema node on path "${fullPath}.schema"`);
    }

    _.each(node.schema, (item, name) => {
      const deepFullPath = _.trim(`${fullPath}.schema.${name}`, '.');
      this._processingNode(deepFullPath, item);
    });
  }

  _insert(path, node) {
    if (path) {
      _.set(this._fullSchema, path, node);
    }
    else {
      // root
      this._fullSchema = node;
    }
  }

}

export default function(shortSchema) {
  const convert = new Convert(shortSchema);

  return convert.convert();
}
