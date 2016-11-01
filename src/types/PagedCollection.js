// Paged collection

import _ from 'lodash';

import { concatPath } from '../helpers';
import _TypeBase from './_TypeBase';

export default class PagedCollection extends _TypeBase {
  constructor(main) {
    super(main);

    this.type = 'pagedCollection';
  }

  $init(root, schema) {
    super.$init(root, schema);
  }

  /**
   * Get instance of page.
   * @param {number} pageNum
   * @returns {object} - instance of child
   */
  child(pageNum) {
    if (!_.isNumber(pageNum)) throw new Error(`The pageNum must be type of number!`);

    // TODO: test it

    var pathToChild = concatPath(this._root, pageNum);
    // get container instance
    var instance = this._main.schemaManager.getInstance(pageNum);
    // reinit container instance with correct path
    instance.$init(pathToChild, instance.schema);

    return instance;
  }

  /**
   * Get list with all the items of all the pages.
   */
  getFlat() {
    // TODO: test it
    return _.flatMap(_.cloneDeep(this.mold));
  }

  /**
   * Get copy of list of pages.
   */
  getMold() {
    // TODO: test it
    return _.cloneDeep(this.mold);
  }

  /**
   * add item to the end of last page.
   */
  addItem(item) {
    var lastPage;

    if (!_.isPlainObject(item))
      throw new Error(`You can add only item of plain object type!`);

    if (_.isEmpty(this.mold)) {
      // TODO: add first empty page
      lastPage = [];
      //this._main.state.setMold(concatPath(this._root, 0), []);
      //this._main.state.addMold(this._root, []);
      this._main.state.addPage(this._root, []);
    }
    else {
      // TODO: проверить если страница полная, то добавить в новую
      lastPage = _.last(this.mold);
    }


    //lastPage.push(item);

    //this._main.state.setMold(this._root, newMold);



    this._main.state.addToEnd(concatPath(this._root, 0), item);

    // TODO: add item to page
  }

  /**
   * Add list of items. They will be separate to pages
   * @param items
   */
  addManyItems(items) {
    // TODO: test it
  }

  /**
   * Add page to mold
   * @param {number} pageNum
   * @param {array} page
   */
  // addPage(pageNum, page) {
  //   if (!_.isNumber(pageNum)) throw new Error(`The pageNum must be type of number!`);
  //   if (!_.isArray(page)) throw new Error(`The page must be type of array!`);
  //
  //   // TODO: нужно ли здесь полное клонирование???
  //   var newMold = _.clone(this.mold);
  //   newMold[pageNum] = page;
  //
  //   this._main.state.setMold(this._root, newMold);
  // }

  /**
   * Remove page
   * @param {number} pageNum
   */
  removePage(pageNum) {
    // TODO: !!!!
  }
}
