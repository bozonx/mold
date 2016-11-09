export default class _TypeBase {
  constructor(main) {
    this._main = main;
  }

  /**
   * Get root path
   * @returns {string}
   */
  get root() {
    return '' + this._root;
  }

  /**
   * Get real mold.
   */
  get mold() {
    return this._mold;
  }

  /**
   * Get copy of mold.
   */
  getMold() {
    return _.cloneDeep(this._mold);
  }

  $init(root) {
    this._root = root;
    // mold is just a link to the storage
    this._mold = this._main.$$state.getMold(this._root);
  }

  destroy() {
    this._main.$$state.destroy(this._root);
  }

  // onChange(handler) {
  //   this._main.state.addListener(this._root, handler);
  // }
  //
  // offChange(handler) {
  //   this._main.state.removeListener(this._root, handler);
  // }

}
