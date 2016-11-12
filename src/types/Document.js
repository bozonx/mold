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

  getUrlParams() {
    return this._main.$$state.getUrlParams(this._root);
  }

  setUrlParams(params) {
    this._main.$$state.setUrlParams(this._root, params);
  }

  /**
   * Load data from driver.
   * @returns {Promise}
   */
  load() {
    return this._main.$$state.$$request.loadDocument(this._root, this.getUrlParams());
  }

  /**
   * Save actual state.
   * @returns {Promise}
   */
  save() {
    return this._main.$$state.$$request.saveDocument(this._root, this.mold, this.getUrlParams());
  }

}
