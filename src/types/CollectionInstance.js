// We can filter or find param
import _ from 'lodash';

export default class CollectionInstance {
  constructor(main) {
    this._main = main;
  }

  init(root, schema) {
    this._root = root;
    this.schema = schema;
    // mold is just a link to the composition
    this.mold = {};
    this._initComposition();
    this.updateMold();
  }

  /**
   * Get instance root
   * @returns {string}
   */
  getRoot() {
    return '' + this._root;
  }

  /**
   * Get child
   * @param {string} path - path relative to this instance root
   * @returns {object} - instance of child
   */
  child(path) {
    // TODO: test for get long path
    // TODO: [num] в пути это primary id - нужно преобразовать

    if (!path)
      throw new Error(`You must pass a path argument.`);

    var fullPath = this._fullPath(path);
    var schemaPath = this._convertToSchemaPath(fullPath);
    var instance = this._main.schemaManager.getInstance(schemaPath);
    // reinit instance with correct path
    instance.init(fullPath, instance.schema);

    return instance;
  }

  /**
   * Get filtered list. Example:
   *     collection.filter({name: {contents: 'item'}})
   * @param {object} params - parameters for query
   */
  filter(params) {
    // TODO: do it
  }

  /**
   * Find one item via params. Example:
   *     collection.find({id: 1})
   * @param {object} params - parameters for query
   */
  find(params) {
    // TODO: do it
  }

  /**
   * Like filter, but it load one page. Example:
   *     collection.page(1)
   *     collection.page(2, {active: true})
   * Page numbers start from 1.
   * @param {number} pageNum -
   * @param {object} [params] - parameters for query
   */
  page(pageNum, params) {
    return this.filter({...params, page: 1});
  }


  /**
   * Add item to list
   * @param item
   * @returns {object} promise
   */
  add(item) {
    // TODO: значение устанавливается до того как будет сделан запрос - это нужно менять в настройках

    return this._main.state.addItem(this._root, item);
    
    
    // var composition = this._main.state.getComposition(this._root);
    // // TODO: validate item
    // composition.push(item);
    // // TODO: return promise
    // //return item;
    // this.updateMold();

    /*
     // TODO: validate item
     var composition = this._state.getComposition(this._root);

     if (!_.isNumber(item[this.primary]))
     throw new Error(`Item ${JSON.stringify(item)} doesn't have primary key value "${this.primary}".`);

     composition[item[this.primary]] = item;

     this._state.setComposition(this._root, composition);

     this.updateMold();
     // TODO: return promise
     */
  }

  /**
   * Remove item by uniq key
   * @param item
   * @returns {object} promise
   */
  remove(item) {
    // TODO: наверное лучше искать по уникальному ключу
    _.remove(this._main.state.getComposition(this._root), item)
    // TODO: return promise
    this.updateMold();
    /*
     var composition = this._state.getComposition(this._root);
     var removeItem = {};
     removeItem[this.primary] = item[this.primary];
     _.remove(composition, removeItem);

     this._state.setComposition(this._root, composition);

     this.updateMold();
     // TODO: return promise
     */
  }

  /**
   * Is param exists on a path
   * It check schema and param in composition.
   * It doesn't do request to driver.
   * @param {string} path - path relative to instance root
   * @returns {boolean}
   */
  has(path) {
    // TODO: test deep param

    if (!path)
      throw new Error(`You must pass a path argument.`);

    // Check schema
    var schemaPath = this._convertToSchemaPath(path);
    if (this._main.schemaManager.has(this._fullPath(schemaPath))) return false;

    // TODO: нужно сделать поиск элементов в mold, так как в пути будет primaryKey, а нам нужен index
    // проще всего преобразовать primaryKey в index
  }

  /**
   * Clear all the list
   */
  clear() {
    // TODO: очистить молд, сделать запрос в драйвер
    // _.remove(this._main.state.getComposition(this._root));
    // this.updateMold();
  }

  updateMold() {
    this.mold = this._main.state.getComposition(this._root);
  }

  _convertToSchemaPath(path) {
    return path.replace(/\[\d+]/, '.item');
  }

  _fullPath(relativePath) {
    if (_.startsWith(relativePath, '['))
      // TODO: without dot
      return `${this._root}${relativePath}`;

    return `${this._root}.${relativePath}`;
  }

  _initComposition() {
    // TODO: это нужно делать при инициализации всей схемы
    if (_.isUndefined(this._main.state.getComposition(this._root)))
      this._main.state.setComposition(this._root, []);
  }
}
