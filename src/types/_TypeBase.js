export default class _TypeBase {
  constructor(main) {
    this._main = main;
  }

  $init(root, schema) {
    this._root = root;
    this.schema = schema;
    // mold is just a link to the storage
    this.updateMold();
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

  getSourceParams() {
    return this._main.state.getSourceParams(this._root);
  }

  setSourceParams(params) {
    this._main.state.setSourceParams(this._root, params);
  }

  // onChange(handler) {
  //   this._main.state.addListener(this._root, handler);
  // }
  //
  // offChange(handler) {
  //   this._main.state.removeListener(this._root, handler);
  // }

  destroy() {
    this._main.state.destroy(this._root);
  }

  updateMold() {
    this.mold = this._main.state.getMold(this._root);
  }
}
