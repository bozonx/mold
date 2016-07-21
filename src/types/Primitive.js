import _ from 'lodash';

import { splitLastParamPath } from '../helpers';


export default class Primitive {
  constructor(main) {
    this._main = main;

    this._main.events.on('mold.composition.update', (data) => {
      if (data.path.indexOf(this._root) === 0) {
        this._updateMold();
        this._main.events.emit('mold.type.event::' + this._root);
      }
    });
  }

  init(root, schema) {
    this._root = root;
    this.schema = schema;
    // mold is just a link to the composition
    this.mold = {};
    this._updateMold();

    var splits = splitLastParamPath(this._root);
    this.basePath = splits.basePath;
    this.paramPath = splits.paramPath;

    this.parent = this._main.schemaManager.getInstance(this.basePath);
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

  /**
   * Get value.
   * @returns {Promise}
   */
  get() {
    // TODO: переделать, вызывать метод родительского контейнера
    return new Promise((resolve, reject) => {
      this._main.state.getContainer(this.basePath).then((resp) => {
        resolve({
          ...resp,
          coocked: _.get(resp.coocked, this.paramPath),
          // TODO: может добавить pathToParam???
        });
        //this._updateMold();
      }, reject);
    });

    //return this._main.state.getContainer(this._root);
  }

  setMold(value) {
    this.parent.setMold(this.paramPath, value);
  }

  save() {
    return new Promise((resolve, reject) => {
      this.parent.save(this.paramPath).then((resp) => {
        resolve({
          ...resp,
          coocked: resp.coocked[this.paramPath],
        });
      }, reject);
    });
  }

  _updateMold() {
    this.mold = this._main.state.getComposition(this._root);
  }

}
