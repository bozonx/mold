// We can filter or find param
import _ from 'lodash';

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

  }

  /**
   * Get filtered list
   * @param params - for parametrized query
   */
  filter(params) {
    // TODO: do it - for server connect
  }

  /**
   * Find one item via params
   * @param params - for parametrized query
   */
  find(params) {
    // TODO: do it - for server connect
  }

  /**
   * Get item from list by primary key.
   * It just useful wrapper for this.child(path)
   * @param {number} primaryId - your promary id, defined in schema
   * @returns {object} - instance of param or list or container
   */
  getItem(primaryId) {

  }

  /**
   * Add item to list
   * @param item
   * @returns {object} promise
   */
  add(item) {
    var composition = this._state.getDirectly(this._root);
    // TODO: validate item
    composition.push(item);
    // TODO: return promise
    //return item;
    this.updateMold();
  }

  /**
   * Remove item by uniq key
   * @param item
   * @returns {object} promise
   */
  remove(item) {
    // TODO: наверное лучше искать по уникальному ключу
    _.remove(this._state.getDirectly(this._root), item)
    // TODO: return promise
    this.updateMold();
  }

  has() {
    // TODO: сделать проверку по всему списку
  }

  /**
   * Set full list silently
   */
  setSilent(list) {
    // TODO: проверить, что установятся значения для всех потомков
    this._state.setValue(this._root, list);
    this.updateMold();
  }

  /**
   * Clear full list
   */
  clear() {
    _.remove(this._state.getDirectly(this._root));
    this.updateMold();
  }

  /**
   * Reset to default for all items in list
   */
  resetToDefault() {
    // TODO: do it
  }

  updateMold() {
    this.mold = this._state.getDirectly(this._root);
  }
  
  _fullPath(relativePath) {
    if (_.startsWith(relativePath, '['))
      return `${this._root}${relativePath}`;

    return `${this._root}.${relativePath}`;
  }

  _initComposition() {
    if (_.isUndefined(this._state.getDirectly(this._root)))
      this._state.setDirectly(this._root, []);
  }
}
