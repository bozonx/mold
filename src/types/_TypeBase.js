export default class _TypeBase {
  constructor(main) {
    this._main = main;
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

  onMoldUpdate(handler) {
    this._main.state.addListener(this._root, handler);
  }

  offMoldUpdate(handler) {
    this._main.state.removeListener(this._root, handler);
  }

  destroy() {
    this._main.state.destroy(this._root);
  }

  updateMold() {
    this.mold = this._main.state.getMold(this._root);
  }
}
