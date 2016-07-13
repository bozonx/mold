import _ from 'lodash';

export default class Container {
  constructor(main) {
    this._main = main;

    this._main.events.on('mold.composition.update', (data) => {
      if (data.path.indexOf(this._root) === 0) {
        this._main.events.emit('mold.type.event::' + this._root);
      }
    });
  }

  init(root, schema) {
    this._root = root;
    this.schema = schema;
    // mold is just a link to the composition
    this.mold = this._main.state.getComposition(this._root);
    this._isDocument = !!this._main.schemaManager.getDocument(this._root);
  }

  isDocument() {
    return this._isDocument;
  }

  /**
   * Get instance root
   * @returns {string}
   */
  getRoot() {
    return '' + this._root;
  }

  onMoldUpdate(cb) {
    // TODO: test it
    this._main.events.on('mold.type.event::' + this._root, cb);
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
    if (path) {
      return new Promise((resolve, reject) => {
        this._main.state.getValue(this._root).then((resp) => {
          resolve({
            ...resp,
            coocked: _.get(resp.coocked, path),
            // TODO: может добавить pathToParam???
          });
        }, reject);
      });
    }

    return this._main.state.getValue(this._root);

    //return this._main.state.getValue((path) ? this._fullPath(path) : this._root);
  }

  /**
   * Set child value for child or for all children.
   * If you pass path = '' or undefined, it means set data for the all children of this container
   * There are 2 ways to use this methods:
   * * set({param: value})
   * * set('param', value)
   * @returns {Promise}
   */
  set(pathOrValue, valueOrNothing) {
    // TODO: just run setMold and save

    var path = pathOrValue;
    var value = valueOrNothing;

    if (_.isPlainObject(pathOrValue)) {
      path = '';
      value = pathOrValue;
    }

    if (path) {
      let payload = _.set({}, path, value);
      return new Promise((resolve, reject) => {
        this._main.state.setValue(this._root, payload).then((resp) => {
          resolve({
            ...resp,
            // TODO: где-то здесь косяк - отдается не полный container а только изменившейся параметр
            coocked: _.get(resp.coocked, path),
            // TODO: может добавить pathToParam???
          });
        }, reject);
      });
    }

    // set whole container
    return this._main.state.setValue(this._root, value);
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
