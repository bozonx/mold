import _ from 'lodash';

import { correctUpdatePayload } from '../helpers';
import Container from './Container';

export default class Document extends Container{
  static validateSchema(schema, schemaPath) {
    if (!_.isPlainObject(schema.schema))
      return `Schema definition of document on "${schemaPath}" must have a "schema" param!`;
  }

  constructor(main) {
    super(main);

    this._lastChanges = {};
  }

  get type() {
    return 'document';
  }

  get loading() {
    return this.mold.$loading;
  }

  get saving() {
    return this.mold.$saving;
  }

  /**
   * Get changes from last save to the moment.
   * @returns {object}
   */
  get lastChanges() {
    return this._lastChanges;
  }

  $init(paths, schema) {
    super.$init(paths, schema);
  }

  getUrlParams() {
    return this._main.$$state.getUrlParams(this._moldPath);
  }

  setUrlParams(params) {
    this._main.$$state.setUrlParams(this._moldPath, params);
  }

  update(newState) {
    this._lastChanges = correctUpdatePayload(this._lastChanges, newState);
    this._main.$$state.update(this._storagePath, _.cloneDeep(newState));
  }

  /**
   * Load data from driver.
   * @param {object} metaParams
   * @returns {Promise}
   */
  load(metaParams=undefined) {
    this._main.$$state.update(this._storagePath, {$loading: true});
    return this._main.$$state.$$request.sendRequest(
        'get', this._moldPath, this._schema, undefined, metaParams, this.getUrlParams())
      .then((resp) => {
        // update mold with server response data
        this._main.$$state.update(this._storagePath, {$loading: false});

        this._main.$$state.update(this._storagePath, resp.body);
        this._lastChanges = {};

        return resp;
      }, (err) => {
        this._main.$$state.update(this._storagePath, {$loading: false});
        return Promise.reject(err);
      });
  }

  /**
   * Save actual state.
   * @param {object|undefined} newState
   * @param {object} metaParams
   * @returns {Promise}
   */
  put(newState=undefined, metaParams=undefined) {
    if (newState) this.update(newState);
    this._main.$$state.update(this._storagePath, {$saving: true});

    return this._main.$$state.$$request.sendRequest(
        'put', this._moldPath, this._schema, this._mold, metaParams, this.getUrlParams()).then((resp) => {
      // update mold with server response data
      this._main.$$state.update(this._storagePath, {
        ...resp.body,
        $saving: false,
      });
      this._lastChanges = {};

      return resp;
    }, (err) => {
      this._main.$$state.update(this._storagePath, {$saving: false});
      return Promise.reject(err);
    });
  }

  /**
   * Save actual state.
   * @param {object|undefined} newState
   * @param {object} metaParams
   * @returns {Promise}
   */
  patch(newState=undefined, metaParams=undefined) {
    if (newState) this.update(newState);
    this._main.$$state.update(this._storagePath, {$saving: true});

    return this._main.$$state.$$request.sendRequest(
      'patch', this._moldPath, this._schema, this._lastChanges, metaParams, this.getUrlParams()).then((resp) => {
      // update mold with server response data
      this._main.$$state.update(this._storagePath, {
        ...resp.body,
        $saving: false,
      });
      this._lastChanges = {};

      return resp;
    }, (err) => {
      this._main.$$state.update(this._storagePath, {$saving: false});
      return Promise.reject(err);
    });
  }

  remove(metaParams=undefined) {
    // TODO: как выяснить что это документ в коллекции - у него есть $pageNum


    // TODO: !!!!! не правильно
    const moldPathToCollection = this._moldPath.replace(/\[\d+]\[\d+]$/, '');
    // TODO: url params брать коллекции или документа??? или объединенные?
    //const urlParams = this.getUrlParams();
    const urlParams = {};



    this._main.$$state.update(this._storagePath, { $deleting: true });

    console.log(77777777777, this._moldPath, this._storagePath, moldPathToCollection)


    return this._main.$$state.$$request.sendRequest(
      'delete', moldPathToCollection, this._schema, this.mold, metaParams, urlParams)
      .then((resp) => {
        this._main.$$state.update(this._storagePath, { $deleting: false });
        // remove from page
        if (_.isNumber(this.mold.$pageIndex)) {
          this._main.$$state.remove(this.mold, this.mold.$pageIndex);
        }
        return resp;
      }, (err) => {
        this._main.$$state.update(this._storagePath, { $deleting: false });
        return Promise.reject(err);
      });
  }

}
