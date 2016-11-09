import Container from './Container';

export default class Document extends Container{
  constructor(main) {
    super(main);
  }

  get type() {
    return 'document';
  }

  $init(root) {
    super.$init(root);
  }

  getSourceParams() {
    return this._main.$$state.getSourceParams(this._root);
  }

  setSourceParams(params) {
    this._main.$$state.setSourceParams(this._root, params);
  }

  /**
   * Load data from driver.
   * @returns {Promise}
   */
  load() {
    return this._main.$$state.$$request.loadDocument(this._root, this.getSourceParams());
  }

  /**
   * Save actual state.
   * @returns {Promise}
   */
  save() {
    return this._main.$$state.$$request.saveDocument(this._root, this.getSourceParams(), this.mold);
  }

}
