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
    return this._main.$$state.$$request.loadDocument(this._root, this.getUrlParams()).then((resp) => {
      // update mold with server response data
      // TODO: если документ находится в documents collection то :
      //        * не втыкать документ на страницу, так как мы не знаем на какой он страницу

      this._main.$$state.update(resp.request.storagePath, resp.body);
      return resp;
    });
  }

  /**
   * Save actual state.
   * @returns {Promise}
   */
  save() {
    return this._main.$$state.$$request.saveDocument(this._root, this.mold, this.getUrlParams());
  }

}
