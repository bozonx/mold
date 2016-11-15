import _ from 'lodash';

import Container from './Container';

export default class Document extends Container{
  constructor(main) {
    super(main);

    this._changesFromLastSave = {};
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
    this._changesFromLastSave = _.defaultsDeep(_.clone(newState), this._changesFromLastSave);
    // fix primitive array update. It must update all the items
    // TODO: нужно поддерживать массивы в глубине
    _.each(newState, (item, name) => {
      // TODO: compact будет тормозить - оптимизировать.
      if (_.isArray(item) && !_.isPlainObject( _.head(_.compact(item)) )) {
        this._changesFromLastSave[name] = item;
      }
    });

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
      this._changesFromLastSave = {};

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
      this._changesFromLastSave = {};

      return resp;
    });
  }

  /**
   * Save actual state.
   * @returns {Promise}
   */
  patch() {
    let metaParams = undefined;
    return this._main.$$state.$$request.sendRequest(
      'patch', this._root, this._changesFromLastSave, metaParams, this.getUrlParams()).then((resp) => {
      // update mold with server response data
      this._main.$$state.updateResponse(this._root, resp.body);
      this._changesFromLastSave = {};

      return resp;
    });
  }

}
