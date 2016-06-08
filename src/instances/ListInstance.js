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
    // TODO: use an unmutable?
    return this._state.getValue(this._root);
  }

  getItem(itemFilterParams) {
    // TODO: возвращаем itemInstance и через него мы можем менять его значения

    // TODO: сделать поддержку колбэка для поиска
    // TODO: в первую очередь искать по уникальному ключу

    var value = _.find(this._state.getDirectly(this._root), itemFilterParams);
    if (_.isUndefined(value))
      throw new Error(`Can't find item by query "${JSON.stringify(itemFilterParams)}" in list "${this._root}"`);

    return value;

    // TODO: сделать чтобы возвращал instance - контейнер или элемент

    // var itemInstance = this._schemaManager.getInstance(`this._root[${itemFilterParams.id}]`);
    //
    // return itemInstance;
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
  }

  has() {
    // TODO: сделать проверку по всему списку
  }

  /**
   * Set full list silently
   */
  setSilent(list) {
    // TODO: проверить, что установятся значения для всех потомков
    return this._state.setValue(this._root, list);
  }

  /**
   * Clear full list
   */
  clear() {
    _.remove(this._state.getDirectly(this._root))
  }

  /**
   * Reset to default for all items in list
   */
  resetToDefault() {
    // TODO: do it
    //this._state.resetToDefault(this._root);
    // TODO: reset to default - должно вызваться сброс по умолчанию у всех элементов списка
  }
  
  _initComposition() {
    if (_.isUndefined(this._state.getDirectly(this._root)))
      this._state.setDirectly(this._root, []);

    return this._state.getDirectly(this._root);
  }
}
