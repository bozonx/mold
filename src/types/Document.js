import Container from './Container';

export default class Document extends Container{
  constructor(main) {
    super(main);
  }

  get type() {
    return 'document';
  }

  $init(root) {
    // TODO: неправильно - mold создается и в обычном хранилище
    //super.$init(root);
    this._root = root;

    // TODO: ??? запросить schemaManager чтобы он выдал mold
    this._mold = this._main.$$state.initResponse(this._root, {});
  }

  child(path) {
    // !!! пока не разрешаем получать потомков, так как придется мого переделывать если
    //     потомки будут коллекциями
  }

  getUrlParams() {
    return this._main.$$state.getUrlParams(this._root);
  }

  setUrlParams(params) {
    this._main.$$state.setUrlParams(this._root, params);
  }

  update(newState) {
    // TODO: нужно использовать универсальный метод, чтобы нормально работал container
    this._main.$$state.updateResponse(this._root, _.cloneDeep(newState));
  }

  /**
   * Load data from driver.
   * @returns {Promise}
   */
  load() {
    return this._main.$$state.$$request.loadDocument(this._root, this.getUrlParams()).then((resp) => {
      // update mold with server response data

      this._main.$$state.updateResponse(this._root, resp.body);
      // TODO: не надо здесь устанавливать mold - он уже должен был установлен
      this._mold = this._main.$$state.getResponse(this._root);

      return resp;
    });
  }

  /**
   * Save actual state.
   * @returns {Promise}
   */
  save() {
    return this._main.$$state.$$request.saveDocument(this._root, this._mold, this.getUrlParams());
  }

}
