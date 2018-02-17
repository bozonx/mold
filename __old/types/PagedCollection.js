// Paged collection
import _ from 'lodash';

import { concatPath, convertFromLodashToSchema } from '../helpers';
import _TypeBase from './_TypeBase';

export default class PagedCollection extends _TypeBase {
  static validateSchema(schema, schemaPath) {
    // if (!_.isPlainObject(schema.item))
    //   return `Schema definition of pagedCollection on "${schemaPath}" must have an "item" param!`;
  }

  constructor(main) {
    super(main);

    this._perPage = undefined;
  }

  get perPage() {
    if (_.isUndefined(this._perPage)) return this._main.config.itemsPerPage;

    return this._perPage;
  }

  set perPage(value) {
    this._perPage = value;
  }

  get type() {
    return 'pagedCollection';
  }

  $initStorage() {
    if (!_.isArray(this._main.$$state.getStorageData(this._storagePagesPath))) {
      this._main.$$state.setSilent(this._storagePagesPath, []);
    }
  }

  $init(paths, schema) {
    this._storagePagesPath = this._storagePagesPath || paths.storage;
    this.$initStorage(paths);
    super.$init(paths, schema);
    this._moldPages = this.mold;
  }

  getPage(pageNum) {
    // получить экземпляр элемента - collection
  }

  getItem(primiryId) {
    // получить экземпляр элемента - container
    // TODO: сделать на основе ниже закомментированного кода
  }

  // /**
  //  * Get instance of child
  //  * @param {string|number} primaryId - primary id like 0 or '[0]'
  //  * @returns {object} - instance of child
  //  */
  // child(primaryId) {
  //   const preparedPath = (_.isNumber(primaryId)) ? `[${primaryId}]` : primaryId;
  //   return this._main.child(preparedPath, this);
  // }
  //
  // /**
  //  * Get paths of child of first level.
  //  * @param {string} primaryId
  //  * @returns {{mold: string, schema: string, storage: string|undefined}}
  //  */
  // $getChildPaths(primaryId) {
  //   const items = _.flatMap(_.cloneDeep(this._moldPages));
  //   const primaryIdNumber = parseInt(primaryId.replace(/\[(\d+)]/, '$1'));
  //   const finded = _.find(items, (item) => {
  //     return item.id === primaryIdNumber;
  //   });
  //
  //   let storage = undefined;
  //   if (finded) {
  //     storage = concatPath(this._storagePagesPath, `[${finded.$pageIndex}][${finded.$index}]`)
  //   }
  //
  //   return {
  //     mold: concatPath(this._moldPath, primaryId),
  //     schema: concatPath(convertFromLodashToSchema(this._moldPath), 'item.item'),
  //     storage,
  //   }
  // }
  //
  // /**
  //  * Get instance of element. (not page!).
  //  * @param {string} primaryId - id of element, like '[0]'
  //  * @returns {Object|undefined} - if undefined - it means not found.
  //  */
  // $getChildInstance(primaryId) {
  //   if (!primaryId || !_.isString(primaryId)) return;
  //   if (!primaryId.match(/^\[\d+]$/)) this._main.$$log.fatal(`Bad primaryId "${primaryId}"`);
  //
  //   const paths = this.$getChildPaths(primaryId);
  //
  //   if (!paths.storage) return;
  //
  //   return this._main.schemaManager.$getInstanceByFullPath(paths);
  // }

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
   * @param {object|undefined} eventData - additional data to event
   */
  unshift(newItem, eventData=undefined) {
    if (!_.isPlainObject(newItem))
      this._main.$$log.fatal(`You can add item only of plain object type!`);

    // there is no matter to up change event, because event will rise after inserting.
    newItem.$addedUnsaved = true;

    this._checkEmptyPage();
    const storagePathToPage = concatPath(this._storagePagesPath, 0);
    this._main.$$state.unshift(storagePathToPage, newItem, eventData);
  }

  /**
   * Add item to end of last page.
   * It add item as is, not clones it.
   * @param {object} newItem
   * @param {object|undefined} eventData - additional data to event
   */
  push(newItem, eventData=undefined) {
    if (!_.isPlainObject(newItem))
      this._main.$$log.fatal(`You can add item only of plain object type!`);

    // there is no matter to up change event, because event will rise after inserting.
    newItem.$addedUnsaved = true;

    this._checkEmptyPage();
    const pageNum = this._moldPages.length - 1;
    const storagePathToPage = concatPath(this._storagePagesPath, pageNum);
    this._main.$$state.push(storagePathToPage, newItem, eventData);
  }

  /**
   * Set page to mold.
   * If pageNum hasn't passed it means add to the end.
   * @param {Array} page
   * @param {number|undefined} pageNum
   * @param {object|undefined} eventData - additional data to event
   */
  setPage(page, pageNum, eventData=undefined) {
    if (_.isUndefined(pageNum)) {
      pageNum = this._moldPages.length;
    }
    else if (!_.isNumber(pageNum)) {
      this._main.$$log.fatal(`The pageNum must be type of number!`);
    }
    if (!_.isArray(page))
      this._main.$$log.fatal(`The page must be type of array!`);

    const preparedPage = _.cloneDeep(page);
    this._main.$$state.setPage(this._storagePagesPath, preparedPage, pageNum, eventData);
  }

  /**
   * Remove page
   * @param {number} pageNum
   * @param {object|undefined} eventData - additional data to event
   */
  removePage(pageNum, eventData=undefined) {
    if (!_.isNumber(pageNum))
      this._main.$$log.fatal(`The pageNum must be type of number!`);

    this._main.$$state.removePage(this._storagePagesPath, pageNum, eventData);
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
      this._main.$$state.setPage(this._storagePagesPath, [], pageNum);
    }
  }

}
