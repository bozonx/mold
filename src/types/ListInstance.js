// Simple list witout queries like filter or find

import _ from 'lodash';

// TODO: значение массива может быть не только {} но и строка или число - как в таком случае использовать primary

export default class ListInstance {
  constructor(state, schemaManager) {
    this._state = state;
    this._schemaManager = schemaManager;
  }

  init(root, schema) {
    this._root = root;
    this.schema = schema;
    // mold is just a link to the composition
    this.mold = {};
    this._initComposition();
    this.updateMold();

    // TODO: взять из схемы promary key
    this.primary = 'id';
  }

  /**
   * Get instance root
   * @returns {string}
   */
  getRoot() {
    return '' + this._root;
  }

  // TODO: add value() or getValue() method - получить значение по пути - нельзя получать корень

  /**
   * Get child
   * @param {string} path - path relative to this instance root
   * @returns {object} - instance of param or list or container
   */
  child(path) {
    // TODO: test for get long path

    if (!path)
      throw new Error(`You must pass a path argument.`);

    var fullPath = this._fullPath(path);
    var schemaPath = fullPath.replace(/\[\d+]/, '.item');
    var instance = this._schemaManager.getInstance(schemaPath);
    // reinit instance with correct path
    instance.init(fullPath, instance.schema);

    return instance;
  }

  /**
   * Get item from list by primary key.
   * It just useful wrapper for this.child(path)
   * @param {number} primaryId - your primary key value, defined in schema
   * @returns {object} - instance of param or list or container
   */
  getItem(primaryId) {
    return this.child(`[${primaryId}]`);
  }

  /**
   * Add item to list
   * @param item
   * @returns {object} promise
   */
  add(item) {
    // TODO: validate item
    var composition = this._state.getComposition(this._root);

    if (!_.isNumber(item[this.primary]))
      throw new Error(`Item ${JSON.stringify(item)} doesn't have primary key value "${this.primary}".`);

    composition[item[this.primary]] = item;

    this._state.setComposition(this._root, composition);

    this.updateMold();
    // TODO: return promise
  }

  /**
   * Remove item by uniq key
   * @param item
   * @returns {object} promise
   */
  remove(item) {
    var composition = this._state.getComposition(this._root);
    var removeItem = {};
    removeItem[this.primary] = item[this.primary];
    _.remove(composition, removeItem);

    this._state.setComposition(this._root, composition);

    this.updateMold();
    // TODO: return promise
  }

  has() {
    // TODO: сделать проверку по всему списку
  }

  /**
   * Set full list silently
   */
  setSilent(list) {
    // TODO: проверить, что установятся значения для всех потомков
    
    if (!_.isArray)
      throw new Error(`You must pass a list argument.`);
    
    this._state.setSilent(this._root, list);
    this.updateMold();
  }

  /**
   * Clear full list
   */
  clear() {
    _.remove(this._state.getComposition(this._root));
    this.updateMold();
  }

  /**
   * Reset to default for all items in list
   */
  resetToDefault() {
    // TODO: do it
    //this._state.resetToDefault(this._root);
    // TODO: reset to default - должно вызваться сброс по умолчанию у всех элементов списка
    this.updateMold();
  }

  updateMold() {
    this.mold = this._state.getComposition(this._root);
  }
  
  _fullPath(relativePath) {
    if (_.startsWith(relativePath, '['))
      return `${this._root}${relativePath}`;

    return `${this._root}.${relativePath}`;
  }

  _initComposition() {
    if (_.isUndefined(this._state.getComposition(this._root)))
      this._state.setComposition(this._root, []);
  }
}
