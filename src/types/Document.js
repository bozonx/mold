import Container from './Container';

export default class Document extends Container{
  constructor(main) {
    super(main);
  }

  get type() {
    return 'document';
  }

  $init(root) {
    this._root = root;

    this._mold = this._main.$$state.initResponse(this._root, {});
  }

  child(path) {
    // TODO: ???
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
    // TODO: формировать правильно url
    this._main.$$state.updateResponse(this._root, _.cloneDeep(newState));
  }

  /**
   * Load data from driver.
   * @returns {Promise}
   */
  load() {
    let metaParams = undefined;
    return this._main.$$state.$$request.sendRequest(
        'get', this._root, undefined, metaParams, this.getUrlParams()).then((resp) => {
      // update mold with server response data

      // TODO: формировать правильно url
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
  put() {
    let metaParams = undefined;
    return this._main.$$state.$$request.sendRequest(
        'put', this._root, this._mold, metaParams, this.getUrlParams()).then((resp) => {
      // update mold with server response data
      this._main.$$state.updateResponse(this._root, resp.body);
      return resp;
    });
  }

}
