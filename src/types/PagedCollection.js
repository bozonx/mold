// Paged collection
import _ from 'lodash';

import { concatPath, convertFromLodashToSchema } from '../helpers';
import _TypeBase from './_TypeBase';

export default class PagedCollection extends _TypeBase {
  constructor(main) {
    super(main);

    this._perPage = undefined;
  }

  get perPage() {
    if (_.isUndefined(this._perPage)) return this._main.$$config.itemsPerPage;

    return this._perPage;
  }

  set perPage(value) {
    this._perPage = value;
  }

  get type() {
    return 'pagedCollection';
  }

  $init(moldPath, schemaPath, schema) {
    super.$init(moldPath, schemaPath, schema);
    this._moldPages = this._mold;
  }

  /**
   * Get instance of child
   * @param {string} path - path relative to this instance root
   * @returns {object} - instance of child
   */
  child(path) {
    return this._main.child(path, this);
  }

  // child(path) {
  //   if (!_.isString(path) || !_.isNumber(path))
  //     this._main.$$log.fatal(`You must pass a path argument.`);
  //
  //
  //
  //   // !!!! мы не знаем на какой страницу находится элемента
  //   // ОТДАВАТЬ ЭЛЕМЕНТ А НЕ СТРАНИЦУ
  //   // должен работать с любым путем, можно получить потомка любой глубины
  //
  //
  //
  //   // if (!_.isNumber(pageNum)) throw new Error(`The pageNum must be type of number!`);
  //   //
  //   // if (_.isUndefined(this.mold[pageNum])) return undefined;
  //   //
  //   // var pathToChild = concatPath(this._root, pageNum);
  //   // // get container instance
  //   // var instance = this._main.$$schemaManager.getInstance(pathToChild);
  //   // // reinit container instance with correct path
  //   // instance.$init(pathToChild);
  //   //
  //   // return instance;
  // }



  /**
   * Get instance of element. (not page!).
   * @param {string} primaryId - id of element, like '[0]'
   * @returns {Object|undefined}
   */
  $getChildInstance(primaryId) {
    if (primaryId.toString().match(/\./)) this._main.$$log.fatal(`Bad primaryId "${primaryId}"`);

    // TODO: всегда отдаем элемент!!!!
    // TODO: все элементы будут иметь путь без учета страницы

    if (!primaryId) return;

    const primaryIdNumber = parseInt(primaryId.replace(/\[(\d+)]/, '$1'));

    const items = this.getFlat();
    let fullChildPath;

    // if (_.isEmpty(items)) {
    //
    // }
    // else {
    //   const finded = _.find(items, (item) => {
    //     // TODO: get primary name
    //     return item.id === primaryIdNumber;
    //   });
    //
    //   // TODO: если нет элемента, то создаем новый
    //   if (!finded) return;
    //
    //   //fullChildPath = concatPath(this._moldPath, `[${finded.$pageIndex}][${finded.$index}]`);
    // }

    fullChildPath = concatPath(this._moldPath, primaryId);

    const fullSchemaPath = concatPath(convertFromLodashToSchema(this._moldPath), 'item.item');


    console.log(8888888, primaryId, primaryIdNumber, items, fullChildPath, fullSchemaPath)

    // const childPath = getFirstChildPath(primaryIdOrSubPath);
    // const fullChildPath = concatPath(this._moldPath, childPath);

    // get container instance
    return this._main.$$schemaManager.$getInstanceByFullPath(fullChildPath, fullSchemaPath);


    // console.log(3333333, path)
    //
    // // TODO: если не передан index - то отдавать страницу, если страницы нет, то undefined
    //
    // // TODO: add it to paged collection
    // if (!_.isNumber(pageNum)) this._main.$$log.fatal(`pageNum parameter has to be a number`);
    //
    // // get path to doc without page num
    // const realPathToDoc = concatPath(concatPath(this._moldPath, pageNum), index);
    // //const pathToDoc = concatPath(this._moldPath, index);
    //
    // console.log(2222, pathToDoc)
    //
    // //const document = this._main.child(pathToDoc);
    //
    // const document = this._main.$$schemaManager.getInstance(pathToDoc);
    // // reinit container instance with correct path
    // document.$init(pathToDoc);
    //
    // console.log(44444, document.mold)
    //
    // return document;
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
      this._main.$$log.fatal(`You can add item only of plain object type!`);

    // there is no matter to up change event, because event will rise after inserting.
    newItem.$addedUnsaved = true;

    this._checkEmptyPage();
    this._main.$$state.unshift(this._moldPath, this._storagePath, newItem, 0);
  }

  /**
   * Add item to end of last page.
   * It add item as is, not clones it.
   * @param {object} newItem
   */
  push(newItem) {
    if (!_.isPlainObject(newItem))
      this._main.$$log.fatal(`You can add item only of plain object type!`);

    // there is no matter to up change event, because event will rise after inserting.
    newItem.$addedUnsaved = true;

    this._checkEmptyPage();
    const pageNum = this._moldPages.length - 1;
    this._main.$$state.push(this._moldPath, this._storagePath, newItem, pageNum);
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
      this._main.$$log.fatal(`The pageNum must be type of number!`);
    }
    if (!_.isArray(page))
      this._main.$$log.fatal(`The page must be type of array!`);

    this._main.$$state.setPage(this._moldPath, this._storagePath, page, pageNum);
  }

  /**
   * Remove page
   * @param {number} pageNum
   */
  removePage(pageNum) {
    if (!_.isNumber(pageNum))
      this._main.$$log.fatal(`The pageNum must be type of number!`);

    this._main.$$state.removePage(this._moldPath, this._storagePath, pageNum);
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
      this._main.$$state.setPage(this._moldPath, this._storagePath, [], pageNum);
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
