// Paged collection

import _ from 'lodash';

import { concatPath } from '../helpers';
import _TypeBase from './_TypeBase';

export default class _PagedCollectionBase extends _TypeBase {
  constructor(main) {
    super(main);

    // TODO: значение по умолчанию брать из конфига
    this._perPage = 10;
  }

  get perPage() {
    return this._perPage;
  }

  set perPage(value) {
    this._perPage = value;
  }

  $init(root) {
    super.$init(root);
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
    var instance = this._main.$$schemaManager.getInstance(pathToChild);
    // reinit container instance with correct path
    instance.$init(pathToChild);

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
   * add item to the end of last page.
   * It creates new page if last page was overflowed
   */
  addItem(item) {
    // TODO: не нужно

    if (!_.isPlainObject(item))
      throw new Error(`You can add item only of plain object type!`);

    this.__checkEmptyPage();

    if (_.last(this.mold).length >= this._perPage) {
      let pageNum = this.mold.length;
      this._main.$$state.setPage(this._root, [item], pageNum);
    }
    else {
      let pageNum = this.mold.length - 1;
      this._main.$$state.push(concatPath(this._root, pageNum), item);
    }
  }

  /**
   * Add item to beginning of first page.
   * It add item as is, not clones it.
   * @param {object} newItem
   */
  unshift(newItem) {
    // TODO: test it
    if (!_.isPlainObject(newItem))
      throw new Error(`You can add item only of plain object type!`);

    this.__checkEmptyPage();
    this._main.$$state.unshift(concatPath(this._root, 0), newItem);
  }

  /**
   * Add item to end of last page.
   * It add item as is, not clones it.
   * @param {object} newItem
   */
  push(newItem) {
    // TODO: test it
    if (!_.isPlainObject(newItem))
      throw new Error(`You can add item only of plain object type!`);

    this.__checkEmptyPage();
    let pageNum = this.mold.length - 1;
    this._main.$$state.push(concatPath(this._root, pageNum), newItem);
  }

  /**
   * It rearrange items
   */
  rearrange() {
    // TODO: test it
    // TODO: оптимизировать производительность
    var items = this.getFlat();
    var pages = [[]];
    _.each(items, (item) => {
      var currentPage = pages.length - 1;
      var currentPageLength = pages[currentPage].length;
      if (currentPageLength >= this._perPage) {
        pages.push([]);
        currentPage++;
      }
      pages[currentPage].push(item);
    });
  }


  /**
   * It create first page if it doesn't exist.
   * @private
   */
  __checkEmptyPage() {
    if (_.isEmpty(this.mold)) {
      let pageNum = 0;
      this._main.$$state.setPage(this._root, [], pageNum);
    }
  }

  /**
   * Set page to mold.
   * It doesn't mark items as unsaved.
   * @param {Array} page
   * @param {number|undefined} pageNum
   */
  __setPage(page, pageNum) {
    if (_.isUndefined(pageNum)) {
      pageNum = (this.mold.length) ? this.mold.length : 0;
    }
    else if (!_.isNumber(pageNum)) {
      throw new Error(`The pageNum must be type of number!`);
    }
    if (!_.isArray(page))
      throw new Error(`The page must be type of array!`);

    this._main.$$state.setPage(this._root, page, pageNum);
  }

  /**
   * Remove page
   * @param {number} pageNum
   */
  __removePage(pageNum) {
    // TODO: !!!!
  }

  // /**
  //  * Add list of items. They will be spread to pages.
  //  * @param items
  //  */
  // batchAdd(items) {
  //   // TODO: test it
  //   if (!_.isArray(items))
  //     throw new Error(`You can add only items of array type!`);
  //
  //   // TODO: делать всё за одно изменение - должно подняться одно событие
  // }
  //
  // batchRemove(items) {
  //   // TODO: !!!!
  // }
}
