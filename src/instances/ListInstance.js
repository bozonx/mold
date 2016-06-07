import _ from 'lodash';

export default class ListInstance {
  constructor(root, schema, state, schemaManager) {
    this._root = root;
    this._state = state;
    this._schemaManager = schemaManager;
    this.schema = schema;

    // mold is just a link to the composition
    this.mold = this._initComposition();
  }

  /**
   * Get instance root
   * @returns {string}
   */
  getRoot() {
    // TODO: immutable
    return this._root;
  }
  
  /**
   * Get full list
   * @param params - for parametrized query
   */
  get(params) {
    // TODO: do parametrized query
    // TODO: return instance instead value
    return this._state.getValue(this._root);
  }

  getItem(itemFilterParams) {
    // TODO: возвращаем itemInstance и через него мы можем менять его значения
    // TODO: сделать поддержку колбэка для поиска
    // TODO: use an unmutable?
    // TODO: в первую очередь искать по уникальному ключу
    return _.find(this._state.getDirectly(this._root), itemFilterParams);
  }

  /**
   * Add item to list
   * @param item
   */
  add(item) {
    var composition = this._state.getDirectly(this._root);
    // TODO: validate item
    composition.push(item);
    return item;
  }

  /**
   * Remove item by uniq key
   * @param item
   */
  remove(item) {
    // TODO: наверное лучше искать по уникальному ключу
    _.remove(this._state.getDirectly(this._root), item)
  }

  has() {
    // TODO: сделать проверку по всему списку
  }

  /**
   * Set full list silently
   */
  set(list) {
    // TODO: не нужен silent???
    return this._state.setSilent(this._root, list);
  }

  setSilent(list) {
    // TODO: установить значения для всех потомков
  }

  /**
   * Clear full list
   */
  clear() {
    _.remove(this._state.getDirectly(this._root))
  }

  // TODO: reset to default - должно вызваться сброс по умолчанию у всех элементов списка

  _initComposition() {
    return this._state.setDirectly(this._root, []);
  }
}
