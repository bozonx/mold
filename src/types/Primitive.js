import _ from 'lodash';

import { splitLastParamPath } from '../helpers';
import _TypeBase from './_TypeBase';


export default class Primitive extends _TypeBase{
  constructor(main) {
    super(main);

    this._main = main;

    this._main.events.on('mold.composition.update', (data) => {
      if (data.path.indexOf(this._root) === 0) {
        this.updateMold();
        this._main.events.emit('mold.type.event::' + this._root);
      }
    });
  }

  init(root, schema) {
    this._root = root;
    this.schema = schema;
    // mold is just a link to the composition
    this.mold = {};
    this.updateMold();

    var splits = splitLastParamPath(this._root);
    this.basePath = splits.basePath;
    this.paramPath = splits.paramPath;

    this.parent = this._main.schemaManager.getInstance(this.basePath);
  }

  /**
   * Get value.
   * @returns {Promise}
   */
  get() {
    // TODO: ???? переделать, вызывать метод родительского контейнера
    return new Promise((resolve, reject) => {
      this._main.state.getContainer(this.basePath).then((resp) => {
        resolve({
          ...resp,
          coocked: _.get(resp.coocked, this.paramPath),
          // TODO: может добавить pathToParam???
        });
      }, reject);
    });
  }

  setMold(value) {
    this._main.state.setMold(this._root, value);
  }

  save() {
    // TODO: не правильно вызывать метод контейнера, дергаем напрямую State
    return new Promise((resolve, reject) => {
      this.parent.save(this.paramPath).then((resp) => {
        resolve({
          ...resp,
          coocked: resp.coocked[this.paramPath],
        });
      }, reject);
    });
  }

}
