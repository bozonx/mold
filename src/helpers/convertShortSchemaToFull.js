class Convert {
  constructor(shortSchema) {
    this.shortSchema = shortSchema;
    this._fullSchema = {};
  }

  convert() {
    // TODO: корень не должен быть контейнером

    this._recursive('', this.shortSchema);

    return this._fullSchema;
  }

  _recursive(fullPath, node) {
    if (_.isPlainObject(node)) {

      if (node.type) {
        // node
        // just set it to fullSchema
        // TODO: не будет работать с путем ''
        _.set(this._fullSchema, fullPath, node);

        // go deeper
        if (node.schema) {
          // TODO: пройтись по элементам схемы
          // TODO: схема контейнера или документа - assoc - простой объект
          const deepFullPath = _.trim(`${fullPath}.schema`, '.');
          recursive(deepFullPath, node.schema);
        }
        // TODO: item - это assoc - простой объект
        // else if (node.item) {
        //   const deepFullPath = _.trim(`${fullPath}.item`, '.');
        //   recursive(deepFullPath, node.item);
        // }
      }
      else {
        // short container
        // convert to full container
        const fullContainer = {
          type: 'container',
          schema: node,
        };

        // TODO: не будет работать с путем ''
        _.set(this._fullSchema, fullPath, fullContainer);

        // go deeper
        const deepFullPath = _.trim(`${fullPath}.schema`, '.');
        // TODO: пройтись по элементам схемы
        this._recursive(deepFullPath, fullContainer.schema);
      }

    }
    else {
      this._main.$$log.fatal(`ERROR: bad schema on ${fullPath}`);
    }
  }

}

export default function(shortSchema) {
  const convert = new Convert(shortSchema);

  return convert.convert();
}
