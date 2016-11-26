// Paged collection
import _ from 'lodash';

import { concatPath } from '../helpers';
import _TypeBase from './_TypeBase';

export default class PagedCollection extends _TypeBase {
  constructor(main) {
    super(main);

    this._perPage = undefined;
  }

  get perPage() {
    // TODO: значение по умолчанию брать из конфига
    if (_.isUndefined(this._perPage)) return 10;

    return this._perPage;
  }

  set perPage(value) {
    this._perPage = value;
  }

  get type() {
    return 'pagedCollection';
  }

  $init(root) {
    super.$init(root);
    this._storagePath = this._root;
    this._moldPages = this._mold;
  }


  /**
   * Get instance of page.
   * @param {string|number} path
   * @returns {object|undefined} - instance of Collection of undefined if page not found.
   */
  child(path) {
    if (!_.isString(path) || !_.isNumber(path))
      throw new Error(`You must pass a path argument.`);



    // TODO: !!!! мы не знаем на какой страницу находится элемента
    // TODO: ОТДАВАТЬ ЭЛЕМЕНТ А НЕ СТРАНИЦУ
    // TODO: должен работать с любым путем, можно получить потомка любой глубины



    // if (!_.isNumber(pageNum)) throw new Error(`The pageNum must be type of number!`);
    //
    // if (_.isUndefined(this.mold[pageNum])) return undefined;
    //
    // var pathToChild = concatPath(this._root, pageNum);
    // // get container instance
    // var instance = this._main.$$schemaManager.getInstance(pathToChild);
    // // reinit container instance with correct path
    // instance.$init(pathToChild);
    //
    // return instance;
  }

  /**
   * Get list with all the items of all the pages.
   * It removes $index param.
   */
  getFlat() {
    return _.flatMap(_.cloneDeep(this._moldPages), (page) => {
      return _.map(page, (item) => {
        delete item.$index;
        delete item.$pageIndex;
        return item;
      })
    });
  }

  /**
   * Add item to beginning of first page.
   * It add item as is, not clones it.
   * @param {object} newItem
   */
  unshift(newItem) {
    if (!_.isPlainObject(newItem))
      throw new Error(`You can add item only of plain object type!`);

    // there is no matter to up change event, because event will rise after inserting.
    newItem.$addedUnsaved = true;

    this._checkEmptyPage();
    this._main.$$state.unshift(this._root, this._storagePath, newItem, 0);
  }

  /**
   * Add item to end of last page.
   * It add item as is, not clones it.
   * @param {object} newItem
   */
  push(newItem) {
    if (!_.isPlainObject(newItem))
      throw new Error(`You can add item only of plain object type!`);

    // there is no matter to up change event, because event will rise after inserting.
    newItem.$addedUnsaved = true;

    this._checkEmptyPage();
    const pageNum = this._moldPages.length - 1;
    this._main.$$state.push(this._root, this._storagePath, newItem, pageNum);
  }

  /**
   * Set page to mold.
   * If pageNum hasn't passed it means add to the end.
   * @param {Array} page
   * @param {number|undefined} pageNum
   */
  setPage(page, pageNum) {
    if (_.isUndefined(pageNum)) {
      pageNum = this._moldPages.length;
    }
    else if (!_.isNumber(pageNum)) {
      throw new Error(`The pageNum must be type of number!`);
    }
    if (!_.isArray(page))
      throw new Error(`The page must be type of array!`);

    this._main.$$state.setPage(this._root, this._storagePath, page, pageNum);
  }

  /**
   * Remove page
   * @param {number} pageNum
   */
  removePage(pageNum) {
    if (!_.isNumber(pageNum)) {
      throw new Error(`The pageNum must be type of number!`);
    }

    this._main.$$state.removePage(this._root, this._storagePath, pageNum);
  }

  /**
   * It rearrange items
   */
  rearrange() {
    // TODO: test it
    // TODO: оптимизировать производительность
    const items = this.getFlat();
    const pages = [[]];
    _.each(items, (item) => {
      var currentPage = pages.length - 1;
      var currentPageLength = pages[currentPage].length;
      if (currentPageLength >= this._perPage) {
        pages.push([]);
        currentPage++;
      }
      pages[currentPage].push(item);
    });

    // TODO: воткнуть это в mold и удалить лишние страницы - хотя mutate должет сделать это сам
  }

  /**
   * It create first page if it doesn't exist.
   * @private
   */
  _checkEmptyPage() {
    if (_.isEmpty(this._moldPages)) {
      const pageNum = 0;
      this._main.$$state.setPage(this._root, this._storagePath, [], pageNum);
    }
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
