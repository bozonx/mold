import _ from 'lodash';

import _TypeBase from './_TypeBase';


export default class Container extends _TypeBase{
  constructor(main) {
    super(main);

    this._main = main;

    this._main.events.on('mold.composition.update', (data) => {
      if (data.path.indexOf(this._root) === 0) {
        // TODO: not need
        this.mold = this._main.state.getComposition(this._root);

        this._main.events.emit('mold.type.event::' + this._root);
      }
    });

  }

  init(root, schema) {
    this._root = root;
    this.schema = schema;
    // mold is just a link to the composition
    this.mold = {};
    this.updateMold();
    this._isDocument = !!this._main.schemaManager.getDocument(this._root);
  }

  /**
   * Get child
   * @param {string} path - path relative to this instance root
   * @returns {object} - instance of param or list or container
   */
  child(path) {
    if (!path)
      throw new Error(`You must pass a path argument.`);

    return this._main.schemaManager.getInstance(this._fullPath(path));
  }

  /**
   * Request for data.
   * If you pass path = '' or undefined, it means get data for this container
   * @param {string} path - path relative to this instance root
   * @returns {Promise}
   */
  get(path) {
    return this._main.state.load((path) ? this._fullPath(path) : this._root);

    // if (path) {
    //
    //   // TODO: переделать на load
    //   return new Promise((resolve, reject) => {
    //     this._main.state.load(this._root).then((resp) => {
    //       resolve({
    //         ...resp,
    //         coocked: _.get(resp.coocked, path),
    //         // TODO: может добавить pathToParam???
    //       });
    //     }, reject);
    //   });
    // }
    //
    // //return this._main.state.getContainer(this._root);
    // return this._main.state.load(this._root).then(() => {
    //   // TODO: not need
    //   this.mold = this._main.state.getComposition(this._root);
    // });
  }

  setMold(pathOrValue, valueOrNothing) {
    var path = pathOrValue;
    var value = valueOrNothing;
    var payload;

    if (_.isPlainObject(pathOrValue)) {
      path = '';
      value = pathOrValue;
    }

    if (path) {
      payload = _.set(_.cloneDeep(this.mold), path, value);
    }
    else {
      // set whole container
      payload = _.defaultsDeep(value, _.cloneDeep(this.mold));
    }

    this._main.state.setMold(this._root, payload);
  }

  save(pathOrNothing) {
    var path;
    if (pathOrNothing) {
      path = this._fullPath(pathOrNothing);
    }
    else {
      path = this._root;
    }

    return this._main.state.saveContainerOrPrimitive(path);
  }

  _fullPath(relativePath) {
    return `${this._root}.${relativePath}`;
  }
}
