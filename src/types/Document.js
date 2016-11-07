import Container from './Container';

export default class Document extends Container{
  constructor(main) {
    super(main);
  }

  get type() {
    return 'document';
  }

  $init(root, schema) {
    super.$init(root, schema);
  }

  /**
   * Load data.
   * @returns {Promise}
   */
  load() {
    return this._main.$$state.load(this._root, this.getSourceParams());
  }

  /**
   * Save date.
   * @returns {Promise}
   */
  save() {
    return this._main.$$state.save(this._root, this.getSourceParams());
  }

}
