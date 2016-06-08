// Simple list witout queries like filter or find

import _ from 'lodash';

// TODO: значение массива может быть не только {} но и строка или число

export default class ListInstance {
  constructor(root, schema, state, schemaManager) {
    this._root = root;
    this._state = state;
    this._schemaManager = schemaManager;
    this.schema = schema;
    // mold is just a link to the composition
    this.mold = this._initComposition();

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
    if (!path)
      throw new Error(`You must pass a path argument.`);

    // TODO: test for get long path

    var fullPath = this._fullPath(path);
    var schemaPath = fullPath.replace(/\[\d+]/, '.item');
    var instance = this._schemaManager.getInstance(schemaPath);
    var mold = this._state.getDirectly(fullPath);
    // TODO: не очень хорошо так устанавливать mold
    instance.mold = mold;

    return instance;
  }

  /**
   * Get item from list by primary key.
   * It just useful wrapper for this.child(path)
   * @param {number} primaryId - your promary id, defined in schema
   * @returns {object} - instance of param or list or container
   */
  getItem(primaryId) {
    // TODO: test it
    return this.child(`[${primaryId}]`);

    //return this._schemaManager.getInstance(this._fullPath(`[${primaryId}]`));

    // var value = _.find(this._state.getDirectly(this._root), itemFilterParams);
    // if (_.isUndefined(value))
    //   throw new Error(`Can't find item by query "${JSON.stringify(itemFilterParams)}" in list "${this._root}"`);
    // return value;
  }

  /**
   * Add item to list
   * @param item
   * @returns {object} promise
   */
  add(item) {
    // TODO: validate item
    var composition = this._state.getDirectly(this._root);
    
    if (!_.isNumber(item[this.primary]))
      throw new Error(`Item ${JSON.stringify(item)} doesn't have primary key value "${this.primary}".`);

    composition[item[this.primary]] = item;

    this._state.setDirectly(this._root, composition);

    this._updateMold();
    // TODO: return promise
  }

  /**
   * Remove item by uniq key
   * @param item
   * @returns {object} promise
   */
  remove(item) {
    var composition = this._state.getDirectly(this._root);
    // if (_.isObject(item)) {
    //   // For collections - remove by primary key
    //   var removeItem = {};
    //   removeItem[this.primary] = item[this.primary];
    //   _.remove(composition, removeItem);
    // }
    // else {
    //   // For primitives
    //   _.remove(composition, item);
    // }

    // For collections - remove by primary key
    var removeItem = {};
    removeItem[this.primary] = item[this.primary];
    _.remove(composition, removeItem);

    //this._state.setDirectly(this._root, _.compact(composition));
    this._state.setDirectly(this._root, composition);

    this._updateMold();
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
    this._state.setSilent(this._root, list);
    this._updateMold();
  }

  /**
   * Clear full list
   */
  clear() {
    _.remove(this._state.getDirectly(this._root));
    this._updateMold();
  }

  /**
   * Reset to default for all items in list
   */
  resetToDefault() {
    // TODO: do it
    //this._state.resetToDefault(this._root);
    // TODO: reset to default - должно вызваться сброс по умолчанию у всех элементов списка
    this._updateMold();
  }

  _fullPath(relativePath) {
    if (_.startsWith(relativePath, '['))
      return `${this._root}${relativePath}`;

    return `${this._root}.${relativePath}`;
  }

  _updateMold() {
    this.mold = this._state.getDirectly(this._root);
  }

  _initComposition() {
    if (_.isUndefined(this._state.getDirectly(this._root)))
      this._state.setDirectly(this._root, []);

    return this._state.getDirectly(this._root);
  }
}
