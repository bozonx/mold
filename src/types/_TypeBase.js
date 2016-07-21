export default class _TypeBase {
  constructor(main) {
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

  offMoldUpdate(cb) {
    // TODO: test it
    // TODO: наверное лучше на собственный дестрой удалиь все листереры
    this._main.events.removeListener('mold.type.event::' + this._root, cb);
  }

  updateMold() {
    this.mold = this._main.state.getComposition(this._root);
  }
}
