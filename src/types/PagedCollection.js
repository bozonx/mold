// Paged collection

import _ from 'lodash';

import { concatPath } from '../helpers';
import _TypeBase from './_TypeBase';

export default class PagedCollection extends _TypeBase {
  constructor(main) {
    super(main);

    // TODO: значение по умолчанию брать из конфига
    this._itemsPerPage = 10;
  }

  get type() {
    return 'pagedCollection';
  }

  get itemsPerPage() {
    return this._itemsPerPage;
  }

  set itemsPerPage(value) {
    this._itemsPerPage = value;
  }

  $init(root, schema) {
    super.$init(root, schema);
  }

  /**
   * Get instance of page.
   * @param {number} pageNum
   * @returns {object|undefined} - instance of Collection of undefined if page not found.
   */
  child(pageNum) {
    if (!_.isNumber(pageNum)) throw new Error(`The pageNum must be type of number!`);

    if (_.isUndefined(this.mold[pageNum])) return undefined;

    var pathToChild = concatPath(this._root, pageNum);
    // get container instance
    var instance = this._main.schemaManager.getInstance(pathToChild);
    // reinit container instance with correct path
    instance.$init(pathToChild, instance.schema);

    return instance;
  }

  /**
   * Get list with all the items of all the pages.
   * It removes $index param.
   */
  getFlat() {
    return _.flatMap(_.cloneDeep(this.mold), (page) => {
      return _.map(page, (item) => {
        delete item.$index;
        return item;
      })
    });
  }

  /**
   * Get copy of list of pages.
   */
  getMold() {
    return _.cloneDeep(this.mold);
  }

  /**
   * add item to the end of last page.
   */
  addItem(item) {
    if (!_.isPlainObject(item))
      throw new Error(`You can add only item of plain object type!`);

    if (_.isEmpty(this.mold)) {
      let pageNum = 0;
      this._main.state.addPage(this._root, [item], pageNum);
    }
    else if (_.last(this.mold).length >= this._itemsPerPage) {
      let pageNum = this.mold.length;
      this._main.state.addPage(this._root, [item], pageNum);
    }
    else {
      let pageNum = this.mold.length - 1;
      this._main.state.addToEnd(concatPath(this._root, pageNum), item);
    }
  }

  /**
   * Add page to mold.
   * It doesn't mark items as unsaved.
   * @param {Array} page
   * @param {number|undefined} pageNum
   */
  addPage(page, pageNum) {
    if (_.isUndefined(pageNum)) {
      pageNum = (this.mold.length) ? this.mold.length : 0;
    }
    else if (!_.isNumber(pageNum)) {
      throw new Error(`The pageNum must be type of number!`);
    }
    if (!_.isArray(page))
      throw new Error(`The page must be type of array!`);

    this._main.state.addPage(this._root, page, pageNum);
  }

  /**
   * Remove page
   * @param {number} pageNum
   */
  removePage(pageNum) {
    // TODO: !!!!
  }

  /**
   * Add list of items. They will be separate to pages
   * @param items
   */
  batchAdd(items) {
    // TODO: test it
    if (!_.isArray(items))
      throw new Error(`You can add only items of array type!`);

    // TODO: делать всё за одно изменение - должно подняться одно событие
  }

  batchRemove(items) {
    // TODO: !!!!
  }
}
