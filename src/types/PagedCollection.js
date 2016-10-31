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
    // if (_.isUndefined(primaryIdOrPath))
    //   throw new Error(`You must pass a path argument.`);
    //
    // var pathToChild = concatPath(this._root, primaryIdOrPath);
    // // get container instance
    // var instance = this._main.schemaManager.getInstance(pathToChild);
    // // reinit container instance with correct path
    // instance.$init(pathToChild, instance.schema);
    //
    // return instance;
  }

  /**
   * Get list with all the items of all the pages.
   */
  getFlat() {

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

  }

  /**
   * Add page to mold
   * @param {number} pageNum
   * @param {array} page
   */
  addPage(pageNum, page) {
    //this._main.state.addMold(this._root, item);
  }

  /**
   * Remove page
   * @param {number} pageNum
   */
  removePage(pageNum) {
    //this._main.state.removeMold(this._root, item);
  }
}
